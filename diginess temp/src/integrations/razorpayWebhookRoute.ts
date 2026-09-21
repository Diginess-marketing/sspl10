/**
 * Express Route Handler for Razorpay Webhooks
 * 
 * Endpoint: POST /api/razorpay/webhook
 * 
 * Security:
 * - Verifies HMAC-SHA256 signature from Razorpay
 * - Uses webhook secret from environment variables
 * - Implements idempotency with webhook_events tracking
 * 
 * Usage in server.js:
 * 
 * import { setupRazorpayWebhookRoute } from '@/integrations/razorpayWebhookRoute';
 * 
 * // After app.use(express.json()):
 * setupRazorpayWebhookRoute(app);
 */

import { Router, Request, Response, NextFunction } from 'express';
import {
  verifyWebhookSignature,
  processRazorpayWebhook,
  getWebhookEventStatus,
  recordWebhookEvent,
} from './razorpayWebhook';

interface RazorpayWebhookRequest extends Request {
  rawBody?: Buffer;
}

/**
 * Middleware to capture raw body for signature verification
 * Must be used BEFORE bodyParser for this specific route
 */
function captureRawBody(req: RazorpayWebhookRequest, res: Response, next: NextFunction) {
  if (req.path === '/api/razorpay/webhook') {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => {
      req.rawBody = Buffer.from(data);
      next();
    });
  } else {
    next();
  }
}

/**
 * Setup Razorpay webhook route
 * Call this in server.js before other routes
 */
export function setupRazorpayWebhookRoute(app: any) {
  const router = Router();
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.warn('⚠️  RAZORPAY_WEBHOOK_SECRET not configured. Webhook signature verification will fail.');
  }

  /**
   * POST /api/razorpay/webhook
   * Receive and process Razorpay webhook
   */
  router.post('/webhook', async (req: RazorpayWebhookRequest, res: Response) => {
    try {
      console.log('📨 Webhook request received');
      console.log(`Headers:`, req.headers);
      console.log(`Body:`, JSON.stringify(req.body, null, 2));

      // Get signature from header
      const signature = req.headers['x-razorpay-signature'] as string;

      if (!signature) {
        console.error('❌ Missing X-Razorpay-Signature header');
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Missing X-Razorpay-Signature header',
        });
      }

      // Get the raw body for signature verification
      const body = req.rawBody || JSON.stringify(req.body);

      // Verify signature
      const verification = verifyWebhookSignature(body.toString(), signature, webhookSecret || '');

      if (!verification.valid) {
        console.error('❌ Invalid webhook signature:', verification.error);
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid signature: ' + verification.error,
        });
      }

      console.log('✅ Webhook signature verified');

      // Extract payload
      const payload = req.body;

      if (!payload.event || !payload.entity) {
        console.error('❌ Invalid webhook payload');
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid payload structure',
        });
      }

      // Check if we've already processed this webhook (idempotency)
      const eventId = payload.entity.id;
      const eventStatus = await getWebhookEventStatus(eventId);

      if (eventStatus.processed) {
        console.log(`⏭️  Webhook already processed at ${eventStatus.processedAt}`);
        return res.status(200).json({
          success: true,
          message: 'Webhook already processed',
          eventId,
          processedAt: eventStatus.processedAt,
        });
      }

      // Process the webhook
      const result = await processRazorpayWebhook(payload);

      // Record the event for idempotency
      await recordWebhookEvent(eventId, payload.event, result);

      console.log('✅ Webhook processed successfully:', result);

      return res.status(200).json({
        success: true,
        message: result.message,
        eventId: result.eventId,
      });
    } catch (error) {
      console.error('❌ Webhook processing failed:', error);

      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to process webhook',
        ...(process.env.NODE_ENV === 'development' && {
          details: error instanceof Error ? error.message : String(error),
        }),
      });
    }
  });

  // Mount routes
  app.use('/api/razorpay', router);

  console.log('✅ Razorpay webhook route registered: POST /api/razorpay/webhook');
}

/**
 * Alternative: Export router directly for use in Express
 * 
 * Usage:
 * import razorpayWebhookRouter from '@/integrations/razorpayWebhookRoute';
 * app.use('/api/razorpay', razorpayWebhookRouter);
 */
export default function createRazorpayWebhookRouter() {
  const router = Router();
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  router.post('/webhook', async (req: RazorpayWebhookRequest, res: Response) => {
    try {
      console.log('📨 Razorpay webhook received');

      const signature = req.headers['x-razorpay-signature'] as string;
      if (!signature) {
        return res.status(401).json({ error: 'Missing signature' });
      }

      const body = req.rawBody || JSON.stringify(req.body);
      const verification = verifyWebhookSignature(body.toString(), signature, webhookSecret || '');

      if (!verification.valid) {
        return res.status(401).json({ error: 'Invalid signature' });
      }

      const payload = req.body;
      if (!payload.event || !payload.entity) {
        return res.status(400).json({ error: 'Invalid payload' });
      }

      // Check for duplicate processing
      const eventId = payload.entity.id;
      const eventStatus = await getWebhookEventStatus(eventId);

      if (eventStatus.processed) {
        console.log('Webhook already processed');
        return res.status(200).json({ success: true, message: 'Already processed' });
      }

      // Process webhook
      const result = await processRazorpayWebhook(payload);
      await recordWebhookEvent(eventId, payload.event, result);

      return res.status(200).json({ success: true, message: result.message });
    } catch (error) {
      console.error('Webhook error:', error);
      return res.status(500).json({ error: 'Processing failed' });
    }
  });

  return router;
}

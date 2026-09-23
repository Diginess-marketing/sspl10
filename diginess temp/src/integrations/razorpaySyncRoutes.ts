/**
 * Express Routes for Razorpay Payment Sync
 * 
 * These routes provide manual sync endpoints for:
 * - Testing webhook logic
 * - Syncing missed payments
 * - Getting sync statistics
 * 
 * Routes:
 * - GET  /api/razorpay/sync-status       - Get sync statistics
 * - GET  /api/razorpay/sync/payment/:id  - Get payment status
 * - GET  /api/razorpay/sync/order/:id    - Get order status
 * - POST /api/razorpay/sync/payment      - Sync specific payment
 * - POST /api/razorpay/sync/pending      - Sync all pending payments
 */

import { Router, Request, Response } from 'express';
import {
  getPaymentFromRazorpay,
  getOrderFromRazorpay,
  syncPaymentStatus,
  syncAllPendingPayments,
  getSyncStatistics,
} from './razorpaySyncUtil';

/**
 * Setup sync routes
 */
export function setupRazorpaySyncRoutes(app: any) {
  const router = Router();

  /**
   * GET /api/razorpay/sync-status
   * Get synchronization statistics
   */
  router.get('/sync-status', async (req: Request, res: Response) => {
    try {
      const stats = await getSyncStatistics();
      res.json(stats);
    } catch (error) {
      console.error('Error getting sync status:', error);
      res.status(500).json({
        error: 'Failed to get sync status',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * GET /api/razorpay/sync/payment/:id
   * Get payment status from Razorpay
   * 
   * Usage: GET /api/razorpay/sync/payment/pay_12345
   */
  router.get('/sync/payment/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!id || !id.startsWith('pay_')) {
        return res.status(400).json({
          error: 'Invalid payment ID',
          message: 'Payment ID must start with "pay_"',
        });
      }

      const payment = await getPaymentFromRazorpay(id);
      res.json({
        success: true,
        payment,
      });
    } catch (error) {
      console.error('Error fetching payment:', error);
      res.status(500).json({
        error: 'Failed to fetch payment',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * GET /api/razorpay/sync/order/:id
   * Get order status from Razorpay
   * 
   * Usage: GET /api/razorpay/sync/order/order_12345
   */
  router.get('/sync/order/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!id || !id.startsWith('order_')) {
        return res.status(400).json({
          error: 'Invalid order ID',
          message: 'Order ID must start with "order_"',
        });
      }

      const order = await getOrderFromRazorpay(id);
      res.json({
        success: true,
        order,
      });
    } catch (error) {
      console.error('Error fetching order:', error);
      res.status(500).json({
        error: 'Failed to fetch order',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * POST /api/razorpay/sync/payment
   * Sync specific payment to database
   * 
   * Request body:
   * {
   *   "payment_id": "pay_12345",
   *   "order_id": "order_12345"
   * }
   */
  router.post('/sync/payment', async (req: Request, res: Response) => {
    try {
      const { payment_id, order_id } = req.body;

      if (!payment_id || !order_id) {
        return res.status(400).json({
          error: 'Missing required fields',
          message: 'payment_id and order_id are required',
        });
      }

      const result = await syncPaymentStatus(payment_id, order_id);
      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error('Error syncing payment:', error);
      res.status(500).json({
        error: 'Failed to sync payment',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * POST /api/razorpay/sync/pending
   * Sync all pending payments from Razorpay to database
   * 
   * This endpoint:
   * 1. Finds all registrations with payment_status = 'pending'
   * 2. Fetches current status from Razorpay API
   * 3. Updates database with latest status
   */
  router.post('/sync/pending', async (req: Request, res: Response) => {
    try {
      console.log('📨 Sync pending payments requested');

      const result = await syncAllPendingPayments();

      res.json({
        success: true,
        message: 'Synced pending payments',
        stats: {
          total: result.total,
          synced: result.synced,
          failed: result.failed,
          unchanged: result.unchanged,
        },
        errors: result.errors,
      });
    } catch (error) {
      console.error('Error syncing pending payments:', error);
      res.status(500).json({
        error: 'Failed to sync pending payments',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // Mount routes
  app.use('/api/razorpay', router);

  console.log('✅ Razorpay sync routes registered:');
  console.log('   GET  /api/razorpay/sync-status');
  console.log('   GET  /api/razorpay/sync/payment/:id');
  console.log('   GET  /api/razorpay/sync/order/:id');
  console.log('   POST /api/razorpay/sync/payment');
  console.log('   POST /api/razorpay/sync/pending');
}

export default function createRazorpaySyncRouter() {
  const router = Router();

  router.get('/sync-status', async (req: Request, res: Response) => {
    try {
      const stats = await getSyncStatistics();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get sync status' });
    }
  });

  router.post('/sync/payment', async (req: Request, res: Response) => {
    try {
      const { payment_id, order_id } = req.body;
      const result = await syncPaymentStatus(payment_id, order_id);
      res.json({ success: true, ...result });
    } catch (error) {
      res.status(500).json({ error: 'Failed to sync payment' });
    }
  });

  router.post('/sync/pending', async (req: Request, res: Response) => {
    try {
      const result = await syncAllPendingPayments();
      res.json({ success: true, stats: result });
    } catch (error) {
      res.status(500).json({ error: 'Failed to sync pending' });
    }
  });

  return router;
}

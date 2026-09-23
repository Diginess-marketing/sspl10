/**
 * Razorpay Webhook Handler
 * Processes payment notifications from Razorpay and updates Supabase
 * 
 * Webhook Events Handled:
 * - payment.authorized: Payment authorized (for recurring payments)
 * - payment.captured: Payment captured successfully
 * - payment.failed: Payment failed
 * - order.paid: Order marked as paid
 */

import crypto from 'crypto';
import { supabase } from './supabase/client';

interface RazorpayWebhookPayload {
  event: string;
  created_at: number;
  entity: {
    id: string;
    entity: string;
    amount: number;
    currency: string;
    status: string;
    order_id?: string;
    payment_id?: string;
    customer_id?: string;
    [key: string]: any;
  };
}

interface WebhookVerificationResult {
  valid: boolean;
  error?: string;
}

/**
 * Verify Razorpay webhook signature
 * Razorpay sends: X-Razorpay-Signature header with HMAC-SHA256 signature
 * We verify it using: webhook_secret
 */
export function verifyWebhookSignature(
  body: string,
  signature: string,
  webhookSecret: string,
): WebhookVerificationResult {
  try {
    if (!webhookSecret) {
      return {
        valid: false,
        error: 'Webhook secret not configured',
      };
    }

    if (!signature) {
      return {
        valid: false,
        error: 'Signature header missing',
      };
    }

    // Create HMAC-SHA256 hash of the request body
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex');

    // Compare signatures (constant-time comparison to prevent timing attacks)
    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature),
    );

    return { valid: isValid };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Signature verification failed',
    };
  }
}

/**
 * Handle payment.captured event - Payment successfully captured
 */
async function handlePaymentCaptured(payload: RazorpayWebhookPayload): Promise<void> {
  console.log('💳 Processing payment.captured event:', payload.entity.id);

  const { entity } = payload;

  try {
    // Update player_registrations based on order_id
    if (entity.order_id) {
      const { data, error } = await supabase
        .from('player_registrations')
        .update({
          payment_status: 'completed',
          razorpay_payment_id: entity.id,
          razorpay_order_id: entity.order_id,
          payment_amount: entity.amount / 100, // Convert from paise to rupees
          status: 'completed',
          updated_at: new Date().toISOString(),
        })
        .match({
          razorpay_order_id: entity.order_id,
        })
        .select();

      if (error) {
        console.error('❌ Error updating payment status:', error);
        throw error;
      }

      console.log('✅ Payment captured and status updated:', data);
    }
  } catch (error) {
    console.error('❌ Failed to handle payment.captured:', error);
    throw error;
  }
}

/**
 * Handle payment.failed event - Payment failed
 */
async function handlePaymentFailed(payload: RazorpayWebhookPayload): Promise<void> {
  console.log('❌ Processing payment.failed event:', payload.entity.id);

  const { entity } = payload;

  try {
    if (entity.order_id) {
      const { data, error } = await supabase
        .from('player_registrations')
        .update({
          payment_status: 'failed',
          razorpay_payment_id: entity.id,
          razorpay_order_id: entity.order_id,
          status: 'pending', // Keep registration pending for retry
          payment_error_details: {
            error_code: entity.error_code,
            error_description: entity.error_description,
            error_reason: entity.error_reason,
            error_source: entity.error_source,
            error_step: entity.error_step,
            failed_at: new Date().toISOString(),
          },
          updated_at: new Date().toISOString(),
        })
        .match({
          razorpay_order_id: entity.order_id,
        })
        .select();

      if (error) {
        console.error('❌ Error updating failed payment status:', error);
        throw error;
      }

      console.log('✅ Payment failure recorded:', data);
    }
  } catch (error) {
    console.error('❌ Failed to handle payment.failed:', error);
    throw error;
  }
}

/**
 * Handle payment.authorized event - Payment authorized (for recurring/2FA)
 */
async function handlePaymentAuthorized(payload: RazorpayWebhookPayload): Promise<void> {
  console.log('🔐 Processing payment.authorized event:', payload.entity.id);

  const { entity } = payload;

  try {
    if (entity.order_id) {
      // For authorized payments, we might want to track them differently
      // Update only if not already captured
      const { data: existing } = await supabase
        .from('player_registrations')
        .select('payment_status')
        .match({ razorpay_order_id: entity.order_id })
        .single();

      if (existing?.payment_status === 'completed') {
        console.log('✅ Payment already completed, skipping authorization update');
        return;
      }

      const { data, error } = await supabase
        .from('player_registrations')
        .update({
          razorpay_payment_id: entity.id,
          razorpay_order_id: entity.order_id,
          updated_at: new Date().toISOString(),
        })
        .match({
          razorpay_order_id: entity.order_id,
        })
        .select();

      if (error) {
        console.error('❌ Error updating authorized payment:', error);
        throw error;
      }

      console.log('✅ Payment authorized:', data);
    }
  } catch (error) {
    console.error('❌ Failed to handle payment.authorized:', error);
    throw error;
  }
}

/**
 * Handle order.paid event - Order marked as paid
 */
async function handleOrderPaid(payload: RazorpayWebhookPayload): Promise<void> {
  console.log('🎯 Processing order.paid event:', payload.entity.id);

  const { entity } = payload;

  try {
    const { data, error } = await supabase
      .from('player_registrations')
      .update({
        payment_status: 'completed',
        razorpay_order_id: entity.id,
        payment_amount: entity.amount / 100, // Convert from paise to rupees
        status: 'completed',
        updated_at: new Date().toISOString(),
      })
      .match({
        razorpay_order_id: entity.id,
      })
      .select();

    if (error) {
      console.error('❌ Error updating order paid status:', error);
      throw error;
    }

    console.log('✅ Order marked as paid:', data);
  } catch (error) {
    console.error('❌ Failed to handle order.paid:', error);
    throw error;
  }
}

/**
 * Process incoming webhook from Razorpay
 * Main entry point for webhook handling
 */
export async function processRazorpayWebhook(
  payload: RazorpayWebhookPayload,
): Promise<{
  success: boolean;
  message: string;
  eventId?: string;
}> {
  try {
    console.log(`📨 Webhook received: ${payload.event} at ${new Date(payload.created_at * 1000).toISOString()}`);

    switch (payload.event) {
      case 'payment.captured':
        await handlePaymentCaptured(payload);
        break;

      case 'payment.failed':
        await handlePaymentFailed(payload);
        break;

      case 'payment.authorized':
        await handlePaymentAuthorized(payload);
        break;

      case 'order.paid':
        await handleOrderPaid(payload);
        break;

      default:
        console.log(`⚠️ Unhandled webhook event: ${payload.event}`);
        // Don't fail for unhandled events
    }

    return {
      success: true,
      message: `Webhook ${payload.event} processed successfully`,
      eventId: payload.entity.id,
    };
  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    throw error;
  }
}

/**
 * Get webhook event status from database
 * For idempotency - track which webhooks we've already processed
 */
export async function getWebhookEventStatus(
  eventId: string,
): Promise<{
  processed: boolean;
  processedAt?: string;
  result?: any;
}> {
  try {
    const result = await (supabase
      .from('webhook_events' as any)
      .select('*')
      .eq('event_id', eventId)
      .single() as unknown as Promise<any>);
    const { data, error } = result;

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned (expected for first-time webhooks)
      throw error;
    }

    if (data) {
      return {
        processed: true,
        processedAt: data.processed_at,
        result: data.result,
      };
    }

    return { processed: false };
  } catch (error) {
    console.error('Error checking webhook event status:', error);
    // Don't fail - return not processed
    return { processed: false };
  }
}

/**
 * Record webhook event processing for idempotency
 */
export async function recordWebhookEvent(
  eventId: string,
  eventType: string,
  result: any,
): Promise<void> {
  try {
    const insertResult = await (supabase
      .from('webhook_events' as any)
      .insert([
        {
          event_id: eventId,
          event_type: eventType,
          result,
          processed_at: new Date().toISOString(),
        },
      ]) as unknown as Promise<any>);
    const { error } = insertResult;

    if (error) {
      console.error('Error recording webhook event:', error);
      // Don't throw - logging only
    }
  } catch (error) {
    console.error('Exception recording webhook event:', error);
    // Don't throw - logging only
  }
}

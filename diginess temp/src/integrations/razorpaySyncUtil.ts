/**
 * Manual Webhook Sync Utility
 * Useful for:
 * - Syncing missing payments if webhooks failed
 * - Manual payment status reconciliation
 * - Testing webhook logic
 * 
 * Endpoints:
 * - GET  /api/razorpay/sync-status   - Get payment status from Razorpay
 * - POST /api/razorpay/sync-pending  - Sync all pending payments
 * - POST /api/razorpay/sync-payment  - Sync specific payment by ID
 */

import axios, { AxiosInstance } from 'axios';
import { supabase } from './supabase/client';

interface RazorpayPaymentStatus {
  id: string;
  order_id: string;
  status: 'captured' | 'authorized' | 'failed' | 'created';
  amount: number;
  currency: string;
  error_code?: string;
  error_description?: string;
}

/**
 * Initialize Razorpay API client with credentials
 */
function createRazorpayClient(): AxiosInstance {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error('Razorpay credentials not configured: RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET required');
  }

  const client = axios.create({
    baseURL: 'https://api.razorpay.com/v1',
    auth: {
      username: keyId,
      password: keySecret,
    },
  });

  return client;
}

/**
 * Get payment details from Razorpay API
 */
export async function getPaymentFromRazorpay(paymentId: string): Promise<RazorpayPaymentStatus> {
  try {
    const client = createRazorpayClient();
    const response = await client.get(`/payments/${paymentId}`);

    return {
      id: response.data.id,
      order_id: response.data.order_id,
      status: response.data.status,
      amount: response.data.amount,
      currency: response.data.currency,
      error_code: response.data.error_code,
      error_description: response.data.error_description,
    };
  } catch (error) {
    console.error('Error fetching payment from Razorpay:', error);
    throw error;
  }
}

/**
 * Get order details from Razorpay API
 */
export async function getOrderFromRazorpay(orderId: string): Promise<any> {
  try {
    const client = createRazorpayClient();
    const response = await client.get(`/orders/${orderId}`);

    return {
      id: response.data.id,
      amount: response.data.amount,
      status: response.data.status,
      currency: response.data.currency,
      payments: response.data.payments,
      amount_paid: response.data.amount_paid,
      amount_due: response.data.amount_due,
    };
  } catch (error) {
    console.error('Error fetching order from Razorpay:', error);
    throw error;
  }
}

/**
 * Sync payment status from Razorpay to Supabase
 */
export async function syncPaymentStatus(paymentId: string, orderId: string): Promise<{
  synced: boolean;
  previousStatus?: string;
  currentStatus: string;
  message: string;
}> {
  try {
    console.log(`🔄 Syncing payment ${paymentId} for order ${orderId}`);

    // Fetch current status from Razorpay
    const razorpayPayment = await getPaymentFromRazorpay(paymentId);
    console.log('Razorpay payment status:', razorpayPayment);

    // Get current status from our database
    const { data: currentData } = await supabase
      .from('player_registrations')
      .select('payment_status')
      .eq('razorpay_order_id', orderId)
      .single();

    const previousStatus = currentData?.payment_status || 'unknown';

    let newStatus = 'pending';
    let statusMessage = 'Payment status unknown';

    // Map Razorpay status to our payment_status
    switch (razorpayPayment.status) {
      case 'captured':
        newStatus = 'completed';
        statusMessage = 'Payment captured successfully';
        break;

      case 'authorized':
        newStatus = 'authorized';
        statusMessage = 'Payment authorized but not captured';
        break;

      case 'failed':
        newStatus = 'failed';
        statusMessage = `Payment failed: ${razorpayPayment.error_description || 'Unknown error'}`;
        break;

      case 'created':
        newStatus = 'pending';
        statusMessage = 'Payment order created but not completed';
        break;
    }

    // Update database only if status changed
    if (newStatus !== previousStatus) {
      console.log(`Status changed: ${previousStatus} → ${newStatus}`);

      const updateData: any = {
        payment_status: newStatus,
        razorpay_payment_id: paymentId,
        razorpay_order_id: orderId,
        updated_at: new Date().toISOString(),
      };

      // Add error details if payment failed
      if (newStatus === 'failed') {
        updateData.payment_error_details = {
          error_code: razorpayPayment.error_code,
          error_description: razorpayPayment.error_description,
          synced_at: new Date().toISOString(),
        };
      }

      // Add amount if captured
      if (newStatus === 'completed') {
        updateData.payment_amount = razorpayPayment.amount / 100; // Convert paise to rupees
        updateData.status = 'completed';
      }

      const { error, data } = await supabase
        .from('player_registrations')
        .update(updateData)
        .eq('razorpay_order_id', orderId)
        .select();

      if (error) {
        throw error;
      }

      console.log('✅ Database updated:', data);

      return {
        synced: true,
        previousStatus,
        currentStatus: newStatus,
        message: statusMessage,
      };
    } 
      console.log('Status unchanged:', previousStatus);
      return {
        synced: false,
        previousStatus,
        currentStatus: newStatus,
        message: 'Status already up-to-date',
      };
    
  } catch (error) {
    console.error('Error syncing payment:', error);
    throw error;
  }
}

/**
 * Sync all pending payments in the system
 */
export async function syncAllPendingPayments(): Promise<{
  total: number;
  synced: number;
  failed: number;
  unchanged: number;
  errors: Array<{ orderId: string; error: string }>;
}> {
  try {
    console.log('🔄 Syncing all pending payments...');

    // Get all pending payments from our database
    const { data: pendingPayments, error: queryError } = await supabase
      .from('player_registrations')
      .select('id, razorpay_payment_id, razorpay_order_id, payment_status')
      .eq('payment_status', 'pending')
      .not('razorpay_order_id', 'is', null);

    if (queryError) {
      throw queryError;
    }

    if (!pendingPayments || pendingPayments.length === 0) {
      console.log('No pending payments found');
      return { total: 0, synced: 0, failed: 0, unchanged: 0, errors: [] };
    }

    console.log(`Found ${pendingPayments.length} pending payments to sync`);

    const results = {
      total: pendingPayments.length,
      synced: 0,
      failed: 0,
      unchanged: 0,
      errors: [] as Array<{ orderId: string; error: string }>,
    };

    // Sync each payment
    for (const payment of pendingPayments) {
      try {
        // Skip payments without IDs
        if (!payment.razorpay_payment_id || !payment.razorpay_order_id) {
          results.failed++;
          results.errors.push({
            orderId: payment.razorpay_order_id || 'unknown',
            error: 'Missing payment or order ID',
          });
          continue;
        }

        const syncResult = await syncPaymentStatus(
          payment.razorpay_payment_id,
          payment.razorpay_order_id,
        );

        if (syncResult.synced) {
          results.synced++;
        } else {
          results.unchanged++;
        }
      } catch (error) {
        results.failed++;
        results.errors.push({
          orderId: payment.razorpay_order_id || 'unknown',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    console.log('✅ Sync complete:', results);
    return results;
  } catch (error) {
    console.error('Error syncing pending payments:', error);
    throw error;
  }
}

/**
 * Get sync statistics
 */
export async function getSyncStatistics(): Promise<{
  total_registrations: number;
  by_status: Record<string, number>;
  with_razorpay_ids: number;
  pending_sync: number;
  last_sync_time?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('player_registrations')
      .select('payment_status', { count: 'exact' });

    if (error) throw error;

    const stats = {
      total_registrations: data?.length || 0,
      by_status: {} as Record<string, number>,
      with_razorpay_ids: 0,
      pending_sync: 0,
      last_sync_time: new Date().toISOString(),
    };

    if (data) {
      // Count by status
      for (const record of data) {
        const status = record.payment_status || 'unknown';
        stats.by_status[status] = (stats.by_status[status] || 0) + 1;
      }

      // Count with razorpay IDs
      const { data: withIds } = await supabase
        .from('player_registrations')
        .select('id', { count: 'exact' })
        .not('razorpay_order_id', 'is', null);

      stats.with_razorpay_ids = withIds?.length || 0;

      // Count pending syncs
      const { data: pending } = await supabase
        .from('player_registrations')
        .select('id', { count: 'exact' })
        .eq('payment_status', 'pending')
        .not('razorpay_order_id', 'is', null);

      stats.pending_sync = pending?.length || 0;
    }

    return stats;
  } catch (error) {
    console.error('Error getting sync statistics:', error);
    throw error;
  }
}

/**
 * Schedule periodic sync (for cron jobs)
 * Usage: Call this periodically (e.g., every 5 minutes)
 */
export async function scheduledSync(): Promise<void> {
  try {
    console.log('⏰ Running scheduled webhook sync...');
    const result = await syncAllPendingPayments();

    if (result.synced > 0) {
      console.log(`✅ Synced ${result.synced} payments from pending`);
    }

    if (result.failed > 0) {
      console.warn(`⚠️  Failed to sync ${result.failed} payments:`, result.errors);
    }

    if (result.unchanged > 0) {
      console.log(`ℹ️  ${result.unchanged} payments already up-to-date`);
    }
  } catch (error) {
    console.error('❌ Scheduled sync failed:', error);
  }
}

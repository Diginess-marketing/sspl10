/**
 * Payment Status Synchronization Utilities
 * 
 * This module ensures payment statuses are correctly synchronized with Razorpay
 * using Supabase as the source of truth. It provides multiple methods to verify
 * and update payment statuses.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { supabase } from '@/integrations/supabase/client';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.REACT_APP_RAZORPAY_KEY_ID || '',
  key_secret: process.env.REACT_APP_RAZORPAY_KEY_SECRET || '',
});

export interface PaymentStatusUpdate {
  id: string;
  previousStatus: string;
  newStatus: string;
  razorpayStatus?: string;
  reason: string;
  timestamp: string;
}

export interface PaymentSyncResult {
  totalProcessed: number;
  updated: number;
  noChange: number;
  errors: Array<{ id: string; error: string }>;
  updates: PaymentStatusUpdate[];
}

/**
 * Fetch payment from Razorpay API directly
 */
async function fetchPaymentFromRazorpay(paymentId: string): Promise<any> {
  try {
    const payment = await razorpay.payments.fetch(paymentId);
    return payment;
  } catch (error) {
    console.error(`Error fetching payment ${paymentId} from Razorpay:`, error);
    throw error;
  }
}

/**
 * Get correct payment status from Razorpay
 */
async function getRazorpayPaymentStatus(paymentId: string): Promise<string> {
  try {
    const payment = await fetchPaymentFromRazorpay(paymentId);
    
    // Razorpay payment statuses: created, authorized, failed, captured, refunded
    if (payment.status === 'captured') {
      return 'completed';
    } if (payment.status === 'failed') {
      return 'failed';
    } if (payment.status === 'authorized') {
      return 'authorized';
    } if (payment.status === 'created') {
      return 'pending';
    }
    
    return 'unknown';
  } catch (error) {
    console.error('Error getting payment status from Razorpay:', error);
    throw error;
  }
}

/**
 * Update a single payment's status based on Razorpay verification
 */
export async function updatePaymentStatusFromRazorpay(
  registrationId: string,
  paymentId: string,
): Promise<PaymentStatusUpdate | null> {
  try {
    // Get current status from database
    const { data: registration, error: selectError } = await supabase
      .from('player_registrations' as any)
      .select('id, payment_status, razorpay_payment_id, razorpay_order_id, payment_amount')
      .eq('id', registrationId)
      .single();

    if (selectError) {
      throw new Error(`Failed to fetch registration: ${selectError.message}`);
    }

    if (!registration) {
      throw new Error(`Registration not found: ${registrationId}`);
    }

    const reg = registration as any;

    // Skip if no payment ID
    if (!paymentId && !reg.razorpay_payment_id) {
      return null;
    }

    const actualPaymentId = paymentId || reg.razorpay_payment_id;

    // Get status from Razorpay
    const razorpayStatus = await getRazorpayPaymentStatus(actualPaymentId);
    const currentStatus = reg.payment_status;

    // Check if update is needed
    if (currentStatus === razorpayStatus) {
      console.log(`✅ Status already correct for ${registrationId}: ${currentStatus}`);
      return {
        id: registrationId,
        previousStatus: currentStatus,
        newStatus: razorpayStatus,
        reason: 'No change needed',
        timestamp: new Date().toISOString(),
      };
    }

    // Update the status
    const { data: updatedData, error: updateError } = await supabase
      .from('player_registrations' as any)
      .update({
        payment_status: razorpayStatus,
        status: razorpayStatus === 'completed' ? 'completed' : reg.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', registrationId)
      .select();

    if (updateError) {
      throw new Error(`Failed to update registration: ${updateError.message}`);
    }

    console.log(
      `🔄 Updated payment status for ${registrationId}: ${currentStatus} → ${razorpayStatus}`,
    );

    return {
      id: registrationId,
      previousStatus: currentStatus,
      newStatus: razorpayStatus,
      razorpayStatus,
      reason: 'Synced from Razorpay',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`Error updating payment status for ${registrationId}:`, error);
    throw error;
  }
}

/**
 * Sync all payments with pending status to verify they're not actually completed
 */
export async function syncAllPendingPaymentStatuses(): Promise<PaymentSyncResult> {
  const result: PaymentSyncResult = {
    totalProcessed: 0,
    updated: 0,
    noChange: 0,
    errors: [],
    updates: [],
  };

  try {
    // Fetch all pending payments with Razorpay IDs
    const { data: pendingPayments, error: selectError } = await supabase
      .from('player_registrations' as any)
      .select('id, payment_status, razorpay_payment_id')
      .eq('payment_status', 'pending')
      .not('razorpay_payment_id', 'is', null);

    if (selectError) {
      throw new Error(`Failed to fetch pending payments: ${selectError.message}`);
    }

    if (!pendingPayments || pendingPayments.length === 0) {
      console.log('✅ No pending payments to sync');
      return result;
    }

    console.log(`🔄 Syncing ${pendingPayments.length} pending payments...`);

    // Process each payment
    for (const payment of pendingPayments) {
      try {
        const p = payment as any;
        result.totalProcessed++;

        const update = await updatePaymentStatusFromRazorpay(
          p.id,
          p.razorpay_payment_id,
        );

        if (update) {
          result.updates.push(update);
          if (update.newStatus !== update.previousStatus) {
            result.updated++;
          } else {
            result.noChange++;
          }
        }
      } catch (error) {
        result.errors.push({
          id: (payment as any).id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    console.log('✅ Sync complete:', {
      total: result.totalProcessed,
      updated: result.updated,
      noChange: result.noChange,
      errors: result.errors.length,
    });

    return result;
  } catch (error) {
    console.error('Error syncing pending payments:', error);
    throw error;
  }
}

/**
 * Fix all payments showing wrong status
 * This should be called after webhook migration to ensure all payments are correct
 */
export async function fixAllIncorrectPaymentStatuses(): Promise<PaymentSyncResult> {
  const result: PaymentSyncResult = {
    totalProcessed: 0,
    updated: 0,
    noChange: 0,
    errors: [],
    updates: [],
  };

  try {
    // Fetch all payments with Razorpay IDs (both pending and failed)
    const { data: allPayments, error: selectError } = await supabase
      .from('player_registrations' as any)
      .select('id, payment_status, razorpay_payment_id')
      .in('payment_status', ['pending', 'failed'])
      .not('razorpay_payment_id', 'is', null);

    if (selectError) {
      throw new Error(`Failed to fetch payments: ${selectError.message}`);
    }

    if (!allPayments || allPayments.length === 0) {
      console.log('✅ No payments to fix');
      return result;
    }

    console.log(`🔄 Fixing ${allPayments.length} payments with incorrect status...`);

    // Process each payment
    for (const payment of allPayments) {
      try {
        const p = payment as any;
        result.totalProcessed++;

        const update = await updatePaymentStatusFromRazorpay(
          p.id,
          p.razorpay_payment_id,
        );

        if (update) {
          result.updates.push(update);
          if (update.newStatus !== update.previousStatus) {
            result.updated++;
          } else {
            result.noChange++;
          }
        }
      } catch (error) {
        result.errors.push({
          id: (payment as any).id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    console.log('✅ Fix complete:', {
      total: result.totalProcessed,
      updated: result.updated,
      noChange: result.noChange,
      errors: result.errors.length,
    });

    return result;
  } catch (error) {
    console.error('Error fixing payment statuses:', error);
    throw error;
  }
}

/**
 * Get payment status statistics
 */
export async function getPaymentStatistics(): Promise<{
  total: number;
  byStatus: Record<string, number>;
  withoutPaymentId: number;
  lastUpdated: string;
}> {
  try {
    const { data, error } = await supabase
      .from('player_registrations' as any)
      .select('payment_status');

    if (error) {
      throw error;
    }

    const stats = {
      total: data?.length || 0,
      byStatus: {} as Record<string, number>,
      withoutPaymentId: 0,
      lastUpdated: new Date().toISOString(),
    };

    data?.forEach((record: any) => {
      const status = record.payment_status || 'unknown';
      stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;
    });

    const { data: noIdData } = await supabase
      .from('player_registrations' as any)
      .select('id', { count: 'exact' })
      .is('razorpay_payment_id', null);

    stats.withoutPaymentId = noIdData?.length || 0;

    return stats;
  } catch (error) {
    console.error('Error getting payment statistics:', error);
    throw error;
  }
}

/**
 * Manual sync endpoint for a single payment
 * Call this from API route: GET /api/payments/sync/:registrationId/:paymentId
 */
export async function manualSyncPayment(
  registrationId: string,
  paymentId: string,
): Promise<PaymentStatusUpdate | null> {
  console.log(`🔍 Manual sync requested for ${registrationId} with payment ${paymentId}`);
  return await updatePaymentStatusFromRazorpay(registrationId, paymentId);
}

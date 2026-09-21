/**
 * Payment Status Sync Routes
 * 
 * These endpoints allow manual verification and synchronization of payment statuses
 * with Razorpay to fix any inconsistencies in the database.
 */

import { Router, Request, Response } from 'express';
import {
  updatePaymentStatusFromRazorpay,
  syncAllPendingPaymentStatuses,
  fixAllIncorrectPaymentStatuses,
  getPaymentStatistics,
} from './paymentStatusSync';

const router = Router();

/**
 * GET /api/payments/stats
 * Get payment status statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = await getPaymentStatistics();
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error getting payment stats:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/payments/sync-pending
 * Sync all pending payments with Razorpay to verify actual status
 */
router.post('/sync-pending', async (req: Request, res: Response) => {
  try {
    const result = await syncAllPendingPaymentStatuses();
    res.json({
      success: true,
      message: `Synced ${result.totalProcessed} payments: ${result.updated} updated, ${result.noChange} unchanged, ${result.errors.length} errors`,
      data: result,
    });
  } catch (error) {
    console.error('Error syncing pending payments:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/payments/fix-all
 * Fix all payments with incorrect status (pending/failed)
 */
router.post('/fix-all', async (req: Request, res: Response) => {
  try {
    const result = await fixAllIncorrectPaymentStatuses();
    res.json({
      success: true,
      message: `Fixed ${result.totalProcessed} payments: ${result.updated} updated, ${result.noChange} unchanged, ${result.errors.length} errors`,
      data: result,
    });
  } catch (error) {
    console.error('Error fixing payment statuses:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/payments/sync/:registrationId/:paymentId
 * Manually sync a single payment
 */
router.post('/sync/:registrationId/:paymentId', async (req: Request, res: Response) => {
  try {
    const { registrationId, paymentId } = req.params;

    if (!registrationId || !paymentId) {
      return res.status(400).json({
        success: false,
        error: 'Missing registrationId or paymentId',
      });
    }

    const update = await updatePaymentStatusFromRazorpay(registrationId, paymentId);
    res.json({
      success: true,
      data: update,
    });
  } catch (error) {
    console.error('Error syncing payment:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Export setup function for Express app
 */
export function setupPaymentStatusSyncRoutes(app: any) {
  app.use('/api/payments', router);
  console.log('✅ Payment status sync routes initialized');
}

export default router;

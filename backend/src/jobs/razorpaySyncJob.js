import cron from 'node-cron';
import * as reconciliationService from '../service/reconciliationService.js';
import logger from '../utils/logger.js';

// 20:30 UTC == 02:00 IST, a low-traffic window.
export const SCHEDULE = '30 20 * * *';

/** Reconcile the previous UTC day against Razorpay. */
export async function runDailySync() {
  logger.info('Starting daily Razorpay reconciliation...');

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const day = yesterday.toISOString().split('T')[0];

  try {
    const result = await reconciliationService.reconcile(
      `${day}T00:00:00Z`,
      `${day}T23:59:59Z`
    );
    logger.info('Daily sync completed:', result);
  } catch (error) {
    logger.error('Daily sync failed:', error);
  }
}

/** Register the recurring schedule. */
export function start() {
  cron.schedule(SCHEDULE, runDailySync);
  logger.info('Razorpay synchronization job scheduled (daily 02:00 IST)');
}

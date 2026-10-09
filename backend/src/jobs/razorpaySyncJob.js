import cron from 'node-cron';
import * as reconciliationService from '../service/reconciliationService.js';
import logger from '../utils/logger.js';

// 20:30 UTC == 02:00 IST, a low-traffic window.
export const SCHEDULE = '30 20 * * *';
// Every 30 minutes: settle payments from the last 3 hours that the webhook missed
export const RECOVERY_SCHEDULE = '*/30 * * * *';
const RECOVERY_WINDOW_MS = 3 * 60 * 60 * 1000;

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

/** Recent payments only: a player who paid and closed the page is settled within ~30 minutes. */
export async function runRecovery() {
  const to = new Date();
  const from = new Date(to.getTime() - RECOVERY_WINDOW_MS);
  try {
    const result = await reconciliationService.reconcile(from.toISOString(), to.toISOString());
    if (result.recovered.length) logger.info(`Payment recovery settled ${result.recovered.length} payment(s)`, result.recovered);
  } catch (error) {
    logger.error('Payment recovery failed:', error);
  }
}

/** Register the recurring schedule. */
export function start() {
  cron.schedule(SCHEDULE, runDailySync);
  cron.schedule(RECOVERY_SCHEDULE, runRecovery);
  logger.info('Razorpay synchronization job scheduled (daily 02:00 IST; payment recovery every 30 minutes)');
}

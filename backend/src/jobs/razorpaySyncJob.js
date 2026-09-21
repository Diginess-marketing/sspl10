const cron = require('node-cron');
const reconciliationService = require('../service/reconciliationService');
const logger = require('../utils/logger');

// 20:30 UTC == 02:00 IST, a low-traffic window.
const SCHEDULE = '30 20 * * *';

/** Reconcile the previous UTC day against Razorpay. */
async function runDailySync() {
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
function start() {
  cron.schedule(SCHEDULE, runDailySync);
  logger.info('Razorpay synchronization job scheduled (daily 02:00 IST)');
}

module.exports = { start, runDailySync, SCHEDULE };

import cron from 'node-cron';
import env from '../config/env.js';
import * as emailService from '../service/emailService.js';
import { dailySummary, summaryEmailHtml } from '../service/reportService.js';
import logger from '../utils/logger.js';

// 02:30 UTC == 08:00 IST (PRD section 9: daily summary by email at 8 am)
export const SCHEDULE = '30 2 * * *';

const recipients = () => String(process.env.DAILY_SUMMARY_TO || '').split(',').map((s) => s.trim()).filter((s) => s.includes('@'));

/** Email yesterday's summary to DAILY_SUMMARY_TO. Returns the numbers. */
export async function sendDailySummary() {
  const summary = await dailySummary(1);
  const to = recipients();
  if (!to.length) {
    logger.info('Daily summary not emailed: DAILY_SUMMARY_TO is not set', summary);
    return summary;
  }
  for (const address of to) {
    const result = await emailService.sendEmail({ to: address, subject: `SSPL daily summary · ${summary.day}`, html: summaryEmailHtml(summary, env.siteUrl) });
    if (!result.success) logger.warn(`Daily summary to ${address} failed: ${result.error}`);
  }
  return summary;
}

export function start() {
  cron.schedule(SCHEDULE, () => sendDailySummary().catch((err) => logger.error('Daily summary failed:', err)));
  logger.info('Daily summary job scheduled (08:00 IST)');
}

import cron from 'node-cron';
import * as emailService from '../service/emailService.js';
import * as paymentLedgerModel from '../model/paymentLedgerModel.js';
import * as registrationModel from '../model/registrationModel.js';
import * as emailLogModel from '../model/emailLogModel.js';
import logger from '../utils/logger.js';
import * as template from './templates/paymentReminderEmail.js';

export const SCHEDULE = '*/30 * * * *'; // every 30 minutes
const EMAIL_TYPE = 'payment_reminder';

/**
 * Target people who dropped off between 30 and 90 minutes ago: long enough to
 * be a real abandonment, recent enough that a nudge still helps.
 */
const WINDOW_START_MINUTES = 90;
const WINDOW_END_MINUTES = 30;

/** Don't chase someone who paid, or who we already emailed, within a day. */
const COOLDOWN_HOURS = 24;

const minutesAgo = (from, minutes) => new Date(from.getTime() - minutes * 60 * 1000).toISOString();
const hoursAgo = (from, hours) => new Date(from.getTime() - hours * 60 * 60 * 1000).toISOString();

/**
 * Find abandoned payments in a window and email each person once.
 *
 * @param {string} [customStartTime] ISO start of the window (overrides default).
 * @param {string} [customEndTime] ISO end of the window (overrides default).
 */
export async function checkAndSendReminders(customStartTime = null, customEndTime = null) {
  logger.info('Checking for failed payments to send reminders...');

  const now = new Date();
  const startTime = customStartTime || minutesAgo(now, WINDOW_START_MINUTES);
  const endTime = customEndTime || minutesAgo(now, WINDOW_END_MINUTES);
  const cooldownStart = hoursAgo(now, COOLDOWN_HOURS);

  try {
    // Two sources of drop-offs: payments that failed or were never completed,
    // and registrations where checkout was never reached at all.
    const [ledgerCandidates, pendingRegistrations] = await Promise.all([
      paymentLedgerModel.findIncompleteBetween(startTime, endTime),
      registrationModel.findPendingBetween(startTime, endTime).catch((err) => {
        logger.error('Error fetching pending registrations:', err);
        return [];
      }),
    ]);

    if (ledgerCandidates.length === 0 && pendingRegistrations.length === 0) {
      logger.info('No pending/failed payments found in the target window.');
      return;
    }

    const combined = [
      ...ledgerCandidates.map((c) => ({ email: c.email, source: 'razorpay' })),
      ...pendingRegistrations.map((c) => ({ email: c.email, source: 'registration' })),
    ];

    logger.info(
      `Found ${combined.length} candidates ` +
        `(${ledgerCandidates.length} ledger, ${pendingRegistrations.length} registrations). ` +
        'Verifying eligibility...'
    );

    // One email per person, however many times they retried.
    const uniqueEmails = [
      ...new Set(combined.map((c) => c.email).filter((e) => e && e.includes('@'))),
    ];

    for (const email of uniqueEmails) {
      try {
        const successes = await paymentLedgerModel.findSuccessfulSince(email, cooldownStart);
        if (successes.length > 0) {
          logger.info(`Skipping ${email}: has a successful payment.`);
          continue;
        }

        const alreadySent = await emailLogModel.findSentSince(email, EMAIL_TYPE, cooldownStart);
        if (alreadySent.length > 0) {
          logger.info(`Skipping ${email}: reminder already sent recently.`);
          continue;
        }

        logger.info(`Sending reminder to ${email}...`);
        const result = await emailService.sendEmail({
          to: email,
          subject: template.SUBJECT,
          html: template.HTML,
          text: template.TEXT,
        });

        const candidate = combined.find((c) => c.email === email);
        const sourceLabel =
          candidate?.source === 'registration' ? 'Pending Registration' : 'Failed Payment';

        await emailLogModel.insert({
          recipientEmail: email,
          // The name column doubles as the reason this reminder was sent.
          recipientName: sourceLabel,
          type: EMAIL_TYPE,
          success: result.success,
          error: result.error,
        });
      } catch (err) {
        logger.error(`Error processing reminder for ${email}:`, err);
      }
    }
  } catch (err) {
    logger.error('Error in payment reminder job:', err);
  }
}

/** Register the recurring schedule. */
export function start() {
  cron.schedule(SCHEDULE, () => checkAndSendReminders());
  logger.info('Payment reminder job scheduled (every 30 mins)');
}

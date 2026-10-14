import cron from 'node-cron';
import * as emailService from '../service/emailService.js';
import * as paymentLedgerModel from '../model/paymentLedgerModel.js';
import * as registrationModel from '../model/registrationModel.js';
import * as emailLogModel from '../model/emailLogModel.js';
import logger from '../utils/logger.js';
import * as template from './templates/paymentReminderEmail.js';
import { notifyPlayer } from '../service/playerMessageService.js';

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
      ...ledgerCandidates.map((c) => ({ email: c.email, phone: c.contact, source: 'razorpay' })),
      ...pendingRegistrations.map((c) => ({ email: c.email, phone: c.phone, source: 'registration' })),
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
        // Same reminder on WhatsApp when a template is configured (PRD journey stage 3)
        await notifyPlayer(EMAIL_TYPE, { email, phone: combined.find((c) => c.email === email && c.phone)?.phone, whatsappOnly: true })
          .catch((err) => logger.warn(`WhatsApp reminder failed: ${err.message}`));
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

/**
 * Second reminder the next day (PRD journey stage 3): registrations still unpaid 22-26 hours
 * after they started, once per person.
 */
export async function checkAndSendSecondReminders() {
  const now = new Date();
  try {
    const pending = await registrationModel.findPendingBetween(hoursAgo(now, 26), hoursAgo(now, 22));
    const seen = new Set();
    for (const reg of pending) {
      const email = String(reg.email || '').trim().toLowerCase();
      if (!email.includes('@') || seen.has(email)) continue;
      seen.add(email);
      const weekAgo = hoursAgo(now, 24 * 7);
      if ((await paymentLedgerModel.findSuccessfulSince(email, weekAgo)).length > 0) continue;
      if ((await emailLogModel.findSentSince(email, 'payment_reminder_2', weekAgo)).length > 0) continue;
      const result = await notifyPlayer('payment_reminder_2', { email, phone: reg.phone, name: reg.full_name, registrationId: reg.id });
      logger.info(`Second payment reminder to ${email}: email ${result.email}, WhatsApp ${result.whatsapp}`);
    }
  } catch (err) {
    logger.error('Error in second payment reminder job:', err);
  }
}

/** Register the recurring schedule. */
export function start() {
  cron.schedule(SCHEDULE, () => checkAndSendReminders());
  cron.schedule('15 * * * *', () => checkAndSendSecondReminders()); // hourly, next-day reminder
  logger.info('Payment reminder job scheduled (every 30 mins)');
}

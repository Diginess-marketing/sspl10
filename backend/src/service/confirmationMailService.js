import { sendRegistrationConfirmation } from './registrationEmailService.js';
import env from '../config/env.js';
import * as emailLogModel from '../model/emailLogModel.js';
import * as registrationModel from '../model/registrationModel.js';
import * as paymentLedgerModel from '../model/paymentLedgerModel.js';
import logger from '../utils/logger.js';

const EMAIL_TYPE = 'registration_confirmation';
const inFlight = new Set();

/**
 * Resolve the amount (rupees) for the email. The browser-verify path has no
 * amount, so fall back to the registration row, then the ledger.
 */
async function resolveAmount(registration, payment) {
  const direct = Number(payment.amount ?? registration.payment_amount);
  if (direct > 0) return direct;
  try {
    const row = await paymentLedgerModel.findByPaymentId(payment.paymentId);
    if (Number(row?.amount) > 0) return Number(row.amount);
  } catch {
    /* ledger is optional */
  }
  return 0;
}

async function sendOne(registration, payment) {
  const id = registration.id;
  if (!registration.email) {
    logger.warn(`Confirmation email skipped for ${id}: no email address`);
    return;
  }
  if (inFlight.has(id)) return;
  inFlight.add(id);
  try {
    if (await emailLogModel.hasSuccessForRegistration(id, EMAIL_TYPE)) return;

    const amount = await resolveAmount(registration, payment);
    if (!amount) {
      logger.warn(`Confirmation email skipped for ${id}: amount unknown`);
      return;
    }

    // Sent by the backend (Microsoft 365); the send-confirmation-mail Edge Function is not deployed
    const result = await sendRegistrationConfirmation(registration, { amount, paymentId: payment.paymentId });
    if (!result.success) {
      logger.warn(`Confirmation email for ${id} not sent: ${result.error}`);
    } else {
      logger.info(`Confirmation email sent for registration ${id}`);
    }
  } finally {
    inFlight.delete(id);
  }
}

/**
 * Fire-and-forget: never throws, never awaited by the payment path.
 * Team payments: only the captain gets the mail (the first registration created
 * in the team, which is who pays); teammates are not emailed to avoid spam.
 *
 * @param {{registrationId?:string, teamId?:string}} target
 * @param {{paymentId:string, orderId?:string, amount?:number}} payment
 */
export function sendConfirmationAsync({ registrationId, teamId }, payment) {
  if (!env.supabase.url || !env.supabase.key) {
    logger.warn('Confirmation email skipped: Supabase URL/service key not configured');
    return;
  }
  setImmediate(async () => {
    try {
      let registration = null;
      if (teamId) {
        const players = await registrationModel.findByTeamId(teamId);
        registration =
          [...players]
            .filter((p) => p.email)
            .sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)))[0] || null;
      } else if (registrationId) {
        registration = await registrationModel.findById(registrationId);
      }
      if (!registration) return;
      await sendOne(registration, payment);
    } catch (err) {
      logger.warn('Confirmation email error (ignored):', err?.message || err);
    }
  });
}

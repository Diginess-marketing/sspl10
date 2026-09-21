const razorpayService = require('./razorpayService');
const paymentLedgerModel = require('../model/paymentLedgerModel');
const registrationModel = require('../model/registrationModel');
const { mapPaymentToLedger } = require('../utils/paymentMapper');
const logger = require('../utils/logger');

/** Supabase `in` filters are chunked to keep the query string bounded. */
const COMPARE_CHUNK_SIZE = 100;

/** Razorpay statuses we expect to have a matching SSPL registration. */
const SETTLED_STATUSES = new Set(['captured', 'authorized']);

const toUnixSeconds = (value) =>
  value ? Math.floor(new Date(value).getTime() / 1000) : undefined;

/**
 * Compare Razorpay against our own records for a date range.
 *
 * Refreshes `razorpay_ledger` from the Razorpay API, then reports payments
 * that have no registration and registrations whose status has drifted.
 *
 * @param {string} from ISO date/time, inclusive.
 * @param {string} [to] ISO date/time, inclusive.
 */
async function reconcile(from, to) {
  logger.info(`Reconciling from ${from} to ${to}...`);

  const results = {
    missing_in_sspl: [],
    status_mismatch: [],
    processed_count: 0,
    errors: [],
  };

  try {
    const fromTimestamp = toUnixSeconds(from);
    const payments = await razorpayService.fetchAllPayments({
      from: fromTimestamp,
      to: fromTimestamp ? toUnixSeconds(to) : undefined,
    });

    results.processed_count = payments.length;
    logger.info(`Fetched ${payments.length} payments from Razorpay.`);
    if (payments.length === 0) return results;

    // 1. Refresh the local ledger.
    try {
      const upserted = await paymentLedgerModel.upsertMany(
        payments.map((payment) => mapPaymentToLedger(payment))
      );
      logger.info(`Upserted ${upserted.length} records into razorpay_ledger.`);
    } catch (ledgerError) {
      logger.error('Ledger upsert error:', ledgerError);
      results.errors.push(`Failed to update ledger: ${ledgerError.message}`);
    }

    // 2. Compare against player_registrations, chunk by chunk.
    for (let i = 0; i < payments.length; i += COMPARE_CHUNK_SIZE) {
      const chunk = payments.slice(i, i + COMPARE_CHUNK_SIZE);

      let registrations;
      try {
        registrations = await registrationModel.findByPaymentIds(chunk.map((p) => p.id));
      } catch (ssplError) {
        logger.error('SSPL fetch error:', ssplError);
        results.errors.push(ssplError.message);
        continue;
      }

      const byPaymentId = new Map(registrations.map((r) => [r.razorpay_payment_id, r]));

      for (const payment of chunk) {
        const registration = byPaymentId.get(payment.id);

        if (!registration) {
          if (SETTLED_STATUSES.has(payment.status)) {
            results.missing_in_sspl.push({
              payment_id: payment.id,
              amount: payment.amount / 100,
              status: payment.status,
              email: payment.email,
            });
          }
          continue;
        }

        const ssplStatus = registration.payment_status;
        const mismatch =
          (payment.status === 'captured' && ssplStatus !== 'completed') ||
          (payment.status === 'failed' && ssplStatus !== 'failed');

        if (mismatch) {
          results.status_mismatch.push({
            payment_id: payment.id,
            razorpay_status: payment.status,
            sspl_status: ssplStatus,
            registration_id: registration.id,
          });
        }
      }
    }
  } catch (error) {
    logger.error('Reconciliation error:', error);
    results.errors.push(error.message);
  }

  return results;
}

module.exports = { reconcile };

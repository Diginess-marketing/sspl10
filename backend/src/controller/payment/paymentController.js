import env from '../../config/env.js';
import * as razorpayConfig from '../../config/razorpay.js';
import * as razorpayService from '../../service/razorpayService.js';
import * as reconciliationService from '../../service/reconciliationService.js';
import * as registrationModel from '../../model/registrationModel.js';
import * as teamModel from '../../model/teamModel.js';
import * as trialCandidateModel from '../../model/trialCandidateModel.js';
import * as paymentLedgerModel from '../../model/paymentLedgerModel.js';
import * as sseManager from '../../utils/sseManager.js';
import { mapPaymentToLedger } from '../../utils/paymentMapper.js';
import { toCsv } from '../../utils/csv.js';
import ApiError from '../../utils/ApiError.js';
import logger from '../../utils/logger.js';
import * as validation from './paymentValidation.js';

const DASHBOARD_URL = 'https://dashboard.razorpay.com/app/payments';

const EXPORT_HEADERS = [
  'Payment ID',
  'Order ID',
  'Amount',
  'Status',
  'Email',
  'Contact',
  'Method',
  'Date',
  'Fee',
  'Tax',
];

/* ------------------------------------------------------------------ *
 * Settlement — shared by the checkout callback and the webhook.
 * ------------------------------------------------------------------ */

/**
 * Mark every registration in a team as paid and promote them to trial
 * candidates.
 *
 * @param {string} teamId
 * @param {{paymentId:string, orderId:string, amount?:number}} payment
 * @param {{skipIfSettled?:boolean}} [options] When set, do nothing if every
 *        player in the team is already marked paid (webhook replay guard).
 * @returns {Promise<boolean>} Whether anything was written.
 */
async function settleTeam(teamId, payment, { skipIfSettled = false } = {}) {
  await teamModel.markPaid(teamId, payment);

  const players = await registrationModel.findByTeamId(teamId);
  if (players.length === 0) return false;

  if (skipIfSettled && players.every((player) => player.status === 'paid')) {
    return false;
  }

  await registrationModel.markTeamPaid(teamId, payment);
  await trialCandidateModel.upsertMany(
    players.map((player) => trialCandidateModel.fromRegistration(player, payment.paymentId))
  );

  return true;
}

/**
 * Mark a single registration as paid and promote it to a trial candidate.
 *
 * @param {Object} registration
 * @param {{paymentId:string, orderId:string, amount?:number}} payment
 */
async function settleIndividual(registration, payment) {
  await registrationModel.markPaid(registration.id, payment);
  await trialCandidateModel.upsertMany([
    trialCandidateModel.fromRegistration(registration, payment.paymentId),
  ]);
}

/* ------------------------------------------------------------------ *
 * Public endpoints
 * ------------------------------------------------------------------ */

/** GET /api/health */
export const health = (req, res) => {
  res.json({ status: 'ok' });
};

/** GET /api/config — the publishable Razorpay key for the checkout widget. */
export const getConfig = (req, res) => {
  const keyId = env.razorpay.keyId;
  if (!keyId) {
    throw ApiError.internal('Razorpay key not configured on server');
  }
  res.json({ key: keyId, isTestMode: keyId.startsWith('rzp_test') });
};

/** POST /api/create-order */
export const createOrder = async (req, res) => {
  const { amount, notes } = validation.validateCreateOrder(req.body);

  if (!razorpayConfig.isConfigured()) {
    throw ApiError.internal('Razorpay credentials not configured on the server.');
  }

  logger.info(`Creating Razorpay order: ${amount} paise`);
  const order = await razorpayService.createOrder({ amount, notes });

  res.json({
    success: true,
    order_id: order.id,
    amount: order.amount,
    currency: order.currency,
  });
};

/** GET /api/sse/:registrationId — server-sent events for payment completion. */
export const subscribe = (req, res) => {
  sseManager.subscribe(req.params.registrationId, req, res);
};

/** POST /api/verify-payment — called by the browser after checkout closes. */
export const verifyPayment = async (req, res) => {
  const { registrationId, paymentId, orderId, signature } = validation.validateVerifyPayment(
    req.body
  );

  const isValid = razorpayService.verifyPaymentSignature(
    orderId,
    paymentId,
    signature,
    env.razorpay.keySecret
  );
  if (!isValid) {
    throw ApiError.badRequest('Invalid payment signature');
  }

  const registration = await registrationModel.findById(registrationId);
  if (!registration) {
    throw ApiError.notFound('Registration not found');
  }

  const payment = { paymentId, orderId };

  if (registration.team_id) {
    await settleTeam(registration.team_id, payment);
    res.json({ success: true, message: 'Team payment verified and registrations updated' });
    return;
  }

  await settleIndividual(registration, payment);
  res.json({ success: true, message: 'Payment verified and registration updated' });
};

/**
 * POST /api/webhooks/razorpay
 *
 * Authoritative payment notification from Razorpay. Writes to the ledger,
 * settles the registration if the browser callback never arrived, and pushes
 * an SSE event to any waiting client.
 */
export const handleWebhook = async (req, res) => {
  // Signature is computed over the exact bytes Razorpay sent; `rawBody` is
  // captured by the JSON body parser in app.js.
  const rawBody = req.rawBody ? req.rawBody.toString('utf8') : JSON.stringify(req.body);
  const signature = req.headers['x-razorpay-signature'];

  if (!razorpayService.verifyWebhookSignature(rawBody, signature, env.razorpay.webhookSecret)) {
    return res.status(400).json({ status: 'error', message: 'Invalid Signature' });
  }

  const { event, payload } = req.body;
  logger.info(`Received Razorpay webhook: ${event}`);

  const payment = payload?.payment?.entity;
  if (!payment) {
    return res.json({ status: 'ok' });
  }

  await paymentLedgerModel.upsertMany([mapPaymentToLedger(payment, payload)]);

  const notes = payment.notes || {};
  const registrationId = notes.registrationId || notes.registration_id;
  let teamId = notes.team_id || notes.teamId;

  // The browser callback is best-effort, so the webhook settles anything it
  // finds outstanding. Failures here must not cause Razorpay to retry the
  // whole webhook, so they are logged and swallowed.
  if (payment.status === 'captured') {
    try {
      if (!teamId && registrationId) {
        teamId = await registrationModel.findTeamId(registrationId);
      }

      const settlement = {
        paymentId: payment.id,
        orderId: payment.order_id,
        amount: payment.amount / 100,
      };

      if (teamId) {
        const written = await settleTeam(teamId, settlement, { skipIfSettled: true });
        if (written) {
          logger.info(`Webhook fallback: settled team ${teamId}`);
        }
      } else if (registrationId) {
        const registration = await registrationModel.findById(registrationId);
        if (registration && registration.status !== 'paid') {
          await settleIndividual(registration, settlement);
          logger.info(`Webhook fallback: settled registration ${registrationId}`);
        }
      }
    } catch (fallbackErr) {
      logger.error('Webhook fallback error:', fallbackErr);
    }
  }

  if (registrationId) {
    sseManager.notify(registrationId, { paymentId: payment.id, status: payment.status });
  }

  return res.json({ status: 'ok' });
};

/* ------------------------------------------------------------------ *
 * Admin endpoints
 * ------------------------------------------------------------------ */

/** GET /api/admin/razorpay/transactions */
export const listTransactions = async (req, res) => {
  const { page, limit, filters } = validation.parseTransactionQuery(req.query);
  const { data, count } = await paymentLedgerModel.paginate({ page, limit, filters });

  res.json({
    data: data.map((tx) => ({
      ...tx,
      razorpay_dashboard_url: `${DASHBOARD_URL}/${tx.payment_id}`,
    })),
    pagination: { page, limit, total: count },
  });
};

/** GET /api/admin/razorpay/export — CSV of every matching transaction. */
export const exportTransactions = async (req, res) => {
  const { filters } = validation.parseTransactionQuery(req.query);
  logger.info('Exporting transactions...', filters);

  const transactions = await paymentLedgerModel.fetchAll(filters);

  const csv = toCsv(
    EXPORT_HEADERS,
    transactions.map((tx) => [
      tx.payment_id,
      tx.order_id || '',
      tx.amount,
      tx.status,
      tx.email || '',
      tx.contact || '',
      tx.method || '',
      new Date(tx.created_at).toISOString(),
      tx.fee || 0,
      tx.tax || 0,
    ])
  );

  const filename = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
  res.status(200).send(csv);
};

/** GET /api/admin/razorpay/stats — totals for the current filter. */
export const getStats = async (req, res) => {
  const { filters } = validation.parseTransactionQuery(req.query);

  const transactions = await paymentLedgerModel.fetchAll(filters, {
    columns: 'amount, status',
    ordered: false,
  });

  const stats = {
    total_count: transactions.length,
    total_volume: 0,
    success_count: 0,
    success_volume: 0,
    failed_count: 0,
  };

  for (const tx of transactions) {
    const amount = Number(tx.amount) || 0;
    stats.total_volume += amount;

    if (tx.status === 'captured' || tx.status === 'authorized') {
      stats.success_count += 1;
      stats.success_volume += amount;
    } else if (tx.status === 'failed') {
      stats.failed_count += 1;
    }
  }

  res.json(stats);
};

/** GET /api/admin/razorpay/reconcile */
export const reconcile = async (req, res) => {
  const { from, to } = validation.validateReconcileQuery(req.query);
  res.json(await reconciliationService.reconcile(from, to));
};

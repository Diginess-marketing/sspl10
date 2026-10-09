import env from '../../config/env.js';
import * as razorpayConfig from '../../config/razorpay.js';
import * as razorpayService from '../../service/razorpayService.js';
import * as reconciliationService from '../../service/reconciliationService.js';
import * as registrationModel from '../../model/registrationModel.js';
import { settleIndividual, settleTeam, settleCapturedPayment } from '../../service/paymentSettlementService.js';
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
    // Shape of the pre-restructure server, which the frontend destructures: { order, registrationId }
    order,
    registrationId: notes.registration_id || notes.registrationId || null,
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

  // The browser callback is best-effort, so the webhook settles anything it
  // finds outstanding. Failures here must not cause Razorpay to retry the
  // whole webhook, so they are logged and swallowed.
  if (payment.status === 'captured') {
    try {
      const settled = await settleCapturedPayment(payment);
      if (settled) logger.info(`Webhook fallback: settled ${settled}`);
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

/**
 * POST /api/admin/razorpay/payments/:paymentId/refund  body: { amount?: rupees, reason }
 * Refund from the admin screen (PRD feature 5). The ledger is refreshed from Razorpay, a full
 * refund marks the registration (or team) refunded, and the reason is kept in the action
 * history and on the Razorpay refund.
 */
export const refund = async (req, res) => {
  const { paymentId } = req.params;
  const reason = String(req.body?.reason || '').trim();
  if (!/^pay_[A-Za-z0-9]+$/.test(paymentId)) throw ApiError.badRequest('Invalid payment id');
  if (reason.length < 5) throw ApiError.badRequest('Give a reason for the refund (at least 5 characters)');
  if (!razorpayConfig.isConfigured()) throw ApiError.internal('Razorpay credentials not configured on the server.');

  const payment = await razorpayService.fetchPaymentById(paymentId);
  if (payment.status !== 'captured' && payment.status !== 'refunded') {
    throw ApiError.badRequest(`Only captured payments can be refunded (this one is ${payment.status})`);
  }
  const refundable = payment.amount - (payment.amount_refunded || 0);
  if (refundable <= 0) throw ApiError.badRequest('This payment has already been fully refunded');
  const amount = req.body?.amount === undefined || req.body.amount === '' ? refundable : Math.round(Number(req.body.amount) * 100);
  if (!Number.isFinite(amount) || amount <= 0) throw ApiError.badRequest('Enter a refund amount above zero');
  if (amount > refundable) throw ApiError.badRequest(`At most ₹${(refundable / 100).toLocaleString('en-IN')} can still be refunded`);

  const result = await razorpayService.refundPayment(paymentId, {
    amount,
    notes: { reason: reason.slice(0, 250), refunded_by: req.user?.email || req.user?.id || 'admin' },
  });

  // Refresh the ledger with Razorpay's view of the payment after the refund
  const updated = await razorpayService.fetchPaymentById(paymentId);
  await paymentLedgerModel.upsertMany([mapPaymentToLedger(updated)]);
  const fullyRefunded = updated.amount_refunded >= updated.amount;
  if (fullyRefunded) await registrationModel.markRefunded(paymentId);

  logger.info(`Refund ${result.id}: ₹${amount / 100} of ${paymentId} by ${req.user?.email} (${reason})`);
  res.json({
    success: true,
    refundId: result.id,
    amount: amount / 100,
    status: result.status,
    fullyRefunded,
  });
};

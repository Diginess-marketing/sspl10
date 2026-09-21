const ApiError = require('../../utils/ApiError');

const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 500;

/**
 * Validate an order creation request.
 * @returns {{amount:number, notes:Object}} amount in paise.
 */
function validateCreateOrder(body = {}) {
  const { amount, notes } = body;

  if (amount === undefined || amount === null || amount === '' || Number.isNaN(Number(amount))) {
    throw ApiError.badRequest('Invalid amount');
  }
  if (Number(amount) <= 0) {
    throw ApiError.badRequest('Amount must be greater than zero');
  }

  return {
    amount: Number(amount),
    notes: notes && typeof notes === 'object' ? notes : {},
  };
}

/**
 * Validate a checkout verification request.
 * @returns {{registrationId:string, paymentId:string, orderId:string, signature:string}}
 */
function validateVerifyPayment(body = {}) {
  const { registrationId, paymentId, orderId, signature } = body;

  const missing = Object.entries({ registrationId, paymentId, orderId, signature })
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length) {
    throw ApiError.badRequest(`Missing required field(s): ${missing.join(', ')}`);
  }

  return { registrationId, paymentId, orderId, signature };
}

/**
 * Normalise the shared admin list/export/stats query string.
 * @returns {{page:number, limit:number, filters:Object}}
 */
function parseTransactionQuery(query = {}) {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(
    Math.max(parseInt(query.limit, 10) || DEFAULT_PAGE_SIZE, 1),
    MAX_PAGE_SIZE
  );

  const { status, search, from, to } = query;

  return { page, limit, filters: { status, search, from, to } };
}

/**
 * Validate the reconciliation window.
 * @returns {{from:string, to:string|undefined}}
 */
function validateReconcileQuery(query = {}) {
  const { from, to } = query;
  if (!from) throw ApiError.badRequest('Missing from date');
  if (Number.isNaN(new Date(from).getTime())) {
    throw ApiError.badRequest('Invalid from date');
  }
  if (to && Number.isNaN(new Date(to).getTime())) {
    throw ApiError.badRequest('Invalid to date');
  }
  return { from, to };
}

module.exports = {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  validateCreateOrder,
  validateVerifyPayment,
  parseTransactionQuery,
  validateReconcileQuery,
};

import crypto from 'crypto';
import { getRazorpay } from '../config/razorpay.js';
import logger from '../utils/logger.js';

/**
 * Create an order.
 * @param {{amount:number, currency?:string, notes?:Object}} params amount in paise.
 */
export async function createOrder({ amount, currency = 'INR', notes = {} }) {
  return getRazorpay().orders.create({
    amount: Number(amount),
    currency,
    receipt: `rcpt_${Date.now()}`,
    payment_capture: 1,
    notes,
  });
}

/**
 * Fetch one page of payments.
 * @param {{from?:number, to?:number, count?:number, skip?:number}} options
 *        `from`/`to` are unix timestamps in seconds.
 */
export async function fetchPayments({ from, to, count = 100, skip = 0 } = {}) {
  const response = await getRazorpay().payments.all({
    count,
    skip,
    ...(from && { from }),
    ...(to && { to }),
  });
  return response.items;
}

/**
 * Fetch every payment in a range, paging until Razorpay runs out.
 * Stops at `maxRecords` so an unbounded range cannot run forever.
 */
export async function fetchAllPayments({ from, to, maxRecords = 10000 } = {}) {
  const all = [];
  const count = 100;
  let skip = 0;

  for (;;) {
    const payments = await fetchPayments({ from, to, count, skip });
    all.push(...payments);

    if (payments.length < count) break;
    skip += count;

    if (skip > maxRecords) {
      logger.warn(`Razorpay fetch limit reached (${maxRecords} items), stopping.`);
      break;
    }
  }

  return all;
}

/** Fetch a single payment by id. */
export async function fetchPaymentById(paymentId) {
  return getRazorpay().payments.fetch(paymentId);
}

/** Constant-time comparison of two hex digests of equal length. */
function safeEquals(a, b) {
  const bufA = Buffer.from(String(a), 'utf8');
  const bufB = Buffer.from(String(b), 'utf8');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function hmac(secret, body) {
  return crypto.createHmac('sha256', secret).update(body).digest('hex');
}

/**
 * Verify an `x-razorpay-signature` webhook header against the raw body.
 * @returns {boolean}
 */
export function verifyWebhookSignature(body, signature, secret) {
  if (!secret) {
    logger.warn('Webhook secret not configured; rejecting webhook.');
    return false;
  }
  if (!signature) return false;
  return safeEquals(hmac(secret, body), signature);
}

/**
 * Verify the checkout handler signature returned to the browser.
 * @returns {boolean}
 */
export function verifyPaymentSignature(orderId, paymentId, signature, secret) {
  if (!secret || !signature) return false;
  return safeEquals(hmac(secret, `${orderId}|${paymentId}`), signature);
}

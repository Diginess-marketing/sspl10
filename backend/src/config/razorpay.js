const Razorpay = require('razorpay');
const env = require('./env');
const logger = require('../utils/logger');

let razorpay = null;

if (env.razorpay.keyId && env.razorpay.keySecret) {
  razorpay = new Razorpay({
    key_id: env.razorpay.keyId,
    key_secret: env.razorpay.keySecret,
  });
} else {
  logger.warn(
    'Razorpay credentials not found. Order creation and payment sync will fail ' +
      'until RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are provided.'
  );
}

/**
 * Returns the Razorpay client, or throws if the server was started without
 * credentials. Callers get a clear error instead of a TypeError on `null`.
 */
function getRazorpay() {
  if (!razorpay) {
    throw new Error('Razorpay credentials are not configured on the server.');
  }
  return razorpay;
}

module.exports = { razorpay, getRazorpay, isConfigured: () => Boolean(razorpay) };

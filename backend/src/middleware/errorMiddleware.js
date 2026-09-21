const env = require('../config/env');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

/** Terminal 404 handler for unmatched routes. */
function notFound(req, res) {
  res.status(404).json({ success: false, error: `Route not found: ${req.method} ${req.originalUrl}` });
}

/**
 * Central error handler. Converts thrown errors into a consistent JSON body
 * and hides internal messages in production.
 */
// eslint-disable-next-line no-unused-vars -- Express identifies this by arity.
function errorHandler(err, req, res, next) {
  const status = err instanceof ApiError ? err.status : 500;

  if (status >= 500) {
    logger.error(`${req.method} ${req.originalUrl} failed:`, err);
  } else {
    logger.warn(`${req.method} ${req.originalUrl} -> ${status}: ${err.message}`);
  }

  const message =
    status >= 500 && env.isProduction ? 'Internal Server Error' : err.message;

  res.status(status).json({ success: false, error: message });
}

module.exports = { notFound, errorHandler };

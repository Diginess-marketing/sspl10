const supabase = require('../config/supabase');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

/** Pull a bearer token out of the Authorization header. */
function readBearerToken(req) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return null;
  return header.slice('Bearer '.length).trim() || null;
}

/**
 * Resolve the Supabase user behind a request's bearer token.
 * @returns {Promise<Object|null>}
 */
async function resolveUser(req) {
  const token = readBearerToken(req);
  if (!token) return null;

  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) return null;
    return data.user;
  } catch (err) {
    logger.error('Auth verification failed:', err);
    return null;
  }
}

/**
 * Reject the request unless it carries a valid Supabase session token.
 * On success `req.user` holds the authenticated user.
 */
async function requireAuth(req, res, next) {
  const user = await resolveUser(req);
  if (!user) return next(ApiError.unauthorized('Invalid or missing access token'));
  req.user = user;
  return next();
}

/**
 * Attach `req.user` when a valid token is present, but let anonymous requests
 * through. Useful for endpoints that merely personalise their response.
 */
async function optionalAuth(req, res, next) {
  req.user = await resolveUser(req);
  return next();
}

/**
 * Require an authenticated user carrying the `admin` role.
 * The role is read from Supabase app metadata (set it server-side, never from
 * user metadata, which the client can edit).
 */
async function requireAdmin(req, res, next) {
  const user = await resolveUser(req);
  if (!user) return next(ApiError.unauthorized('Invalid or missing access token'));

  const role = user.app_metadata?.role || user.app_metadata?.claims_admin;
  if (role !== 'admin' && role !== true) {
    return next(ApiError.forbidden('Admin access required'));
  }

  req.user = user;
  return next();
}

module.exports = { requireAuth, optionalAuth, requireAdmin, readBearerToken };

import supabase from '../config/supabase.js';
import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';
import { STAFF_ROLES, can, staffRoleOf } from '../config/staffRoles.js';

/**
 * The assurance level (aal1 / aal2) in a Supabase access token. Only read after
 * supabase.auth.getUser() has verified the same token.
 */
function tokenAal(req) {
  try {
    const payload = readBearerToken(req)?.split('.')[1];
    return payload ? JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')).aal : null;
  } catch {
    return null;
  }
}

/** Pull a bearer token out of the Authorization header. */
export function readBearerToken(req) {
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
export async function requireAuth(req, res, next) {
  const user = await resolveUser(req);
  if (!user) return next(ApiError.unauthorized('Invalid or missing access token'));
  req.user = user;
  return next();
}

/**
 * Attach `req.user` when a valid token is present, but let anonymous requests
 * through. Useful for endpoints that merely personalise their response.
 */
export async function optionalAuth(req, res, next) {
  req.user = await resolveUser(req);
  return next();
}

/**
 * The user's admin row from public.user_roles (the admin panel's source), or null.
 * staff_role is read when the column exists (added by migration 20261009000200).
 */
async function findAdminRow(userId) {
  let { data, error } = await supabase
    .from('user_roles').select('role, staff_role').eq('user_id', userId).eq('role', 'admin').limit(1);
  if (error && /staff_role/.test(error.message)) {
    ({ data, error } = await supabase
      .from('user_roles').select('role').eq('user_id', userId).eq('role', 'admin').limit(1));
  }
  if (error) {
    logger.error('Admin role lookup failed:', error);
    return null;
  }
  return data?.[0] ?? null;
}

let auditTableMissing = false;
const SECRET_KEYS = /password|secret|token|key|signature|card/i;

/** A short, safe copy of a request body for the action history. */
function summarise(body) {
  if (!body || typeof body !== 'object') return {};
  const out = {};
  for (const [k, v] of Object.entries(body)) {
    if (SECRET_KEYS.test(k)) out[k] = '[hidden]';
    else if (typeof v === 'string') out[k] = v.length > 300 ? `${v.slice(0, 300)}…` : v;
    else if (Array.isArray(v)) out[k] = v.length > 20 ? { count: v.length, first: v.slice(0, 20) } : v;
    else out[k] = v;
  }
  const json = JSON.stringify(out);
  return json.length > 8000 ? { truncated: json.slice(0, 8000) } : out;
}

/** Record a change made through the API (PRD: every admin action shows who and when). */
function auditOnFinish(req, res) {
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') return;
  res.on('finish', () => {
    if (auditTableMissing) return;
    supabase.from('admin_audit_log').insert({
      actor_id: req.user?.id,
      actor_email: req.user?.email,
      staff_role: req.staffRole,
      source: 'api',
      action: `${req.method} ${req.originalUrl.split('?')[0]}`,
      entity: req.originalUrl.split('?')[0].replace(/^\/api\/admin\//, '').split('/')[0] || null,
      entity_id: req.params?.id || req.body?.registrationId || req.body?.allocationId || null,
      status: res.statusCode,
      details: summarise(req.body),
      ip: req.ip,
    }).then(({ error }) => {
      if (!error) return;
      if (error.code === 'PGRST205') {
        auditTableMissing = true;
        logger.warn('admin_audit_log table missing; run the pending migration to record admin actions');
      } else {
        logger.warn('Audit log insert failed:', error.message);
      }
    });
  });
}

/**
 * Require an authenticated user carrying the `admin` role.
 * The role is read from Supabase app metadata (set server-side, never from
 * user metadata, which the client can edit) or from the user_roles table.
 * Sets req.user and req.staffRole, and records every change in the action history.
 */
export async function requireAdmin(req, res, next) {
  // Already checked by an earlier middleware on this request (e.g. a router-wide check)
  if (req.user && req.staffRole) return next();

  const user = await resolveUser(req);
  if (!user) return next(ApiError.unauthorized('Invalid or missing access token'));

  const metaRole = user.app_metadata?.role || user.app_metadata?.claims_admin;
  const row = await findAdminRow(user.id);
  const isAdmin = metaRole === 'admin' || metaRole === true || Boolean(row);
  if (!isAdmin) {
    return next(ApiError.forbidden('Admin access required'));
  }

  // REQUIRE_ADMIN_MFA=true: admin requests must come from a session that passed two-step sign-in
  if (process.env.REQUIRE_ADMIN_MFA === 'true' && tokenAal(req) !== 'aal2') {
    return next(ApiError.forbidden('Two-step sign-in is required for admin access. Sign in again and enter your code.'));
  }

  req.user = user;
  req.staffRole = staffRoleOf(row);
  auditOnFinish(req, res);
  return next();
}

/**
 * Admin with a given permission (PRD admin roles), e.g. requirePermission('manage_trials').
 * Use in place of requireAdmin on routes that only some staff roles may use.
 */
export function requirePermission(permission) {
  return (req, res, next) => requireAdmin(req, res, (err) => {
    if (err) return next(err);
    if (!can(req.staffRole, permission)) {
      return next(ApiError.forbidden(`Your role (${STAFF_ROLES[req.staffRole]?.label || req.staffRole}) cannot do this`));
    }
    return next();
  });
}

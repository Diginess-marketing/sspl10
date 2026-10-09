import supabase from '../../config/supabase.js';
import { STAFF_ROLES } from '../../config/staffRoles.js';
import ApiError from '../../utils/ApiError.js';

const BIN_DAYS = 30;
const isUuid = (v) => typeof v === 'string' && /^[0-9a-f-]{36}$/i.test(v);
// Tables a deleted row may be restored into (the ones the audit trigger watches)
const RESTORABLE = new Set([
  'player_registrations', 'teams', 'trials', 'trials_centers', 'trials_allocations', 'player_workflow',
  'trial_candidates', 'trial_progress', 'admin_invites', 'admin_settings', 'rewards', 'sspl_qr_codes',
  'whatsapp_campaigns', 'whatsapp_campaign_recipients', 'email_templates', 'cms_items', 'coupons',
  'selectors', 'tournament_organizers',
]);

const missingTable = (error) => error?.code === 'PGRST205';
const setupPending = () => new ApiError(503, 'Action history is not set up yet. Run the pending database migration (RUN_ONCE_IN_SQL_EDITOR.sql).');

/**
 * PUT /api/admin/staff/:userId/role  body: { role: 'admin'|'user', staffRole?: 'super_admin'|... }
 * Super admins set who is an admin and which staff role they have.
 */
export const setRole = async (req, res) => {
  const { userId } = req.params;
  const { role, staffRole } = req.body || {};
  if (!isUuid(userId)) throw ApiError.badRequest('userId is required');
  if (!['admin', 'user'].includes(role)) throw ApiError.badRequest('role must be admin or user');
  if (role === 'admin' && staffRole && !STAFF_ROLES[staffRole]) throw ApiError.badRequest('Unknown staff role');
  if (userId === req.user.id && (role !== 'admin' || (staffRole && staffRole !== 'super_admin'))) {
    throw ApiError.badRequest('You cannot remove your own super admin access');
  }

  const values = { role, staff_role: role === 'admin' ? (staffRole || 'super_admin') : null, updated_at: new Date().toISOString() };
  const { data: existing, error: findErr } = await supabase.from('user_roles').select('id').eq('user_id', userId).limit(1);
  if (findErr) throw findErr;
  const { error } = existing?.length
    ? await supabase.from('user_roles').update(values).eq('id', existing[0].id)
    : await supabase.from('user_roles').insert({ user_id: userId, ...values });
  if (error && /staff_role/.test(error.message)) throw new ApiError(503, 'Staff roles are not set up yet. Run the pending database migration.');
  if (error) throw error;
  res.json({ success: true, role: values.role, staffRole: values.staff_role });
};

/** GET /api/admin/audit?page=1&limit=50&entity=&actor=&action=&bin=1 */
export const listAudit = async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(200, Math.max(1, Number(req.query.limit) || 50));
  let query = supabase.from('admin_audit_log').select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);
  if (req.query.entity) query = query.eq('entity', String(req.query.entity));
  if (req.query.actor) query = query.ilike('actor_email', `%${String(req.query.actor).replace(/[%_]/g, '\$&')}%`);
  if (req.query.bin === '1') {
    query = query.eq('action', 'DELETE').is('restored_at', null)
      .gte('created_at', new Date(Date.now() - BIN_DAYS * 86400000).toISOString());
  }
  const { data, error, count } = await query;
  if (missingTable(error)) throw setupPending();
  if (error) throw error;
  res.json({ data, total: count ?? 0, page, limit });
};

/** POST /api/admin/audit/:id/restore — put a deleted row back (within 30 days). */
export const restore = async (req, res) => {
  const { data: entry, error } = await supabase.from('admin_audit_log').select('*').eq('id', req.params.id).maybeSingle();
  if (missingTable(error)) throw setupPending();
  if (error) throw error;
  if (!entry || entry.action !== 'DELETE' || !entry.details?.deleted_row) throw ApiError.notFound('No deleted item with that id');
  if (entry.restored_at) throw ApiError.badRequest('Already restored');
  if (Date.now() - new Date(entry.created_at).getTime() > BIN_DAYS * 86400000) throw ApiError.badRequest(`Deleted more than ${BIN_DAYS} days ago`);
  if (!RESTORABLE.has(entry.entity)) throw ApiError.badRequest(`Items from ${entry.entity} cannot be restored here`);

  const { error: insErr } = await supabase.from(entry.entity).insert(entry.details.deleted_row);
  if (insErr) throw ApiError.badRequest(`Could not restore: ${insErr.message}`);
  await supabase.from('admin_audit_log').update({ restored_at: new Date().toISOString() }).eq('id', entry.id);
  res.json({ success: true });
};

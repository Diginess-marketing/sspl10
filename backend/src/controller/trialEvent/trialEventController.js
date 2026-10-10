import supabase from '../../config/supabase.js';
import env from '../../config/env.js';
import ApiError from '../../utils/ApiError.js';
import logger from '../../utils/logger.js';
import * as emailService from '../../service/emailService.js';
import { can } from '../../config/staffRoles.js';
import * as workflow from '../workflow/workflowController.js';

// Trial dates and selectors (PRD section 6: create trial dates and venues, see capacity,
// assign selectors) and selector scoring on a phone (PRD feature 7).

const isUuid = (v) => typeof v === 'string' && /^[0-9a-f-]{36}$/i.test(v);
const norm = (v) => String(v ?? '').trim().toLowerCase();
const venueOf = (t) => [t.trial_venue, t.trial_address].filter(Boolean).join(', ') || t.trial_name;
const missingTable = (e) => e?.code === 'PGRST205';
const FIELDS = ['trial_name', 'trial_date', 'trial_time', 'trial_venue', 'trial_address', 'trial_batch', 'trial_capacity', 'google_map_link'];

/** Allocations booked into a trial (they carry the trial's date and venue text). */
async function allocationsFor(trial) {
  const { data, error } = await supabase.from('trials_allocations')
    .select('allocation_id,workflow_id,allocation_date,allocation_time,allocation_venue,allocation_batch,attendance_status,batting_score,bowling_score,fielding_score,overall_score,selection_status,remarks')
    .eq('allocation_date', trial.trial_date);
  if (error) throw error;
  return (data || []).filter((a) => norm(a.allocation_venue) === norm(venueOf(trial)));
}

async function selectorsByTrial() {
  const { data, error } = await supabase.from('trial_selectors').select('trial_id,email,selector_id,assigned_at');
  if (missingTable(error)) return null; // migration not run yet
  if (error) throw error;
  const map = new Map();
  for (const s of data || []) {
    if (!map.has(s.trial_id)) map.set(s.trial_id, []);
    map.get(s.trial_id).push(s);
  }
  return map;
}

function pickTrial(body) {
  const row = {};
  for (const f of FIELDS) if (body[f] !== undefined) row[f] = body[f] === '' ? null : body[f];
  if (row.trial_capacity !== undefined && row.trial_capacity !== null) {
    const n = Number(row.trial_capacity);
    if (!Number.isInteger(n) || n < 1 || n > 10000) throw ApiError.badRequest('Capacity must be a whole number from 1 to 10000');
    row.trial_capacity = n;
  }
  return row;
}

/* ----------------------------- Admin: trial dates ----------------------------- */

/** GET /api/admin/trial-events — every trial date with booked / attended counts and selectors. */
export const list = async (req, res) => {
  const { data: trials, error } = await supabase.from('trials').select('*').order('trial_date', { ascending: false });
  if (error) throw error;
  const selectors = await selectorsByTrial();
  const out = [];
  for (const t of trials || []) {
    const allocations = await allocationsFor(t);
    out.push({
      ...t,
      venue: venueOf(t),
      booked: allocations.length,
      attended: allocations.filter((a) => a.attendance_status === 'attended').length,
      selectors: selectors ? (selectors.get(t.trial_id) || []).map((s) => s.email) : null,
    });
  }
  res.json({ data: out, selectorsReady: selectors !== null });
};

/** POST /api/admin/trial-events */
export const create = async (req, res) => {
  const row = pickTrial(req.body || {});
  if (!row.trial_date) throw ApiError.badRequest('Date is required');
  if (!row.trial_venue) throw ApiError.badRequest('Venue is required');
  if (!row.trial_name) row.trial_name = `${row.trial_venue} · ${row.trial_date}`;
  const { data, error } = await supabase.from('trials').insert(row).select('*').single();
  if (error) throw error;
  res.json(data);
};

/** PUT /api/admin/trial-events/:id */
export const update = async (req, res) => {
  if (!isUuid(req.params.id)) throw ApiError.badRequest('Invalid trial id');
  const row = pickTrial(req.body || {});
  const { data: before, error: findErr } = await supabase.from('trials').select('*').eq('trial_id', req.params.id).maybeSingle();
  if (findErr) throw findErr;
  if (!before) throw ApiError.notFound('Trial not found');
  const booked = await allocationsFor(before);
  if (booked.length && ((row.trial_date && row.trial_date !== before.trial_date) || row.trial_venue !== undefined || row.trial_address !== undefined)) {
    const after = { ...before, ...row };
    if (row.trial_date !== before.trial_date || norm(venueOf(after)) !== norm(venueOf(before))) {
      throw ApiError.badRequest(`${booked.length} player(s) are booked on this trial. Move them with Change slot first, or create a new trial date.`);
    }
  }
  if (row.trial_capacity && row.trial_capacity < booked.length) {
    throw ApiError.badRequest(`Capacity cannot be below the ${booked.length} players already booked`);
  }
  const { data, error } = await supabase.from('trials').update({ ...row, updated_at: new Date().toISOString() }).eq('trial_id', req.params.id).select('*').single();
  if (error) throw error;
  res.json(data);
};

/** DELETE /api/admin/trial-events/:id — only when nobody is booked. */
export const remove = async (req, res) => {
  const { data: trial, error } = await supabase.from('trials').select('*').eq('trial_id', req.params.id).maybeSingle();
  if (error) throw error;
  if (!trial) throw ApiError.notFound('Trial not found');
  if ((await allocationsFor(trial)).length) throw ApiError.badRequest('Players are booked on this trial; it cannot be deleted');
  const { error: delErr } = await supabase.from('trials').delete().eq('trial_id', req.params.id);
  if (delErr) throw delErr;
  // Keep the deleted row in the action history so it can be restored for 30 days
  const { error: binErr } = await supabase.from('admin_audit_log').insert({
    actor_id: req.user?.id, actor_email: req.user?.email, staff_role: req.staffRole, source: 'api',
    action: 'DELETE', entity: 'trials', entity_id: trial.trial_id, details: { deleted_row: trial },
  });
  if (binErr && binErr.code !== 'PGRST205') logger.warn('Deleted trial not kept in the bin:', binErr.message);
  res.json({ success: true });
};

/** GET /api/admin/trial-events/selectors — approved selectors to choose from. */
export const approvedSelectors = async (req, res) => {
  const { data, error } = await supabase.from('selectors').select('id,full_name,email,city_state,preferred_region,status').order('full_name');
  if (error) throw error;
  res.json((data || []).filter((s) => s.email && ['approved', 'active', 'verified'].includes(norm(s.status))));
};

/** POST /api/admin/trial-events/:id/selectors  body: { selectorId } — assign and email the selector. */
export const assignSelector = async (req, res) => {
  const { data: trial, error } = await supabase.from('trials').select('*').eq('trial_id', req.params.id).maybeSingle();
  if (error) throw error;
  if (!trial) throw ApiError.notFound('Trial not found');
  const { data: selector, error: sErr } = await supabase.from('selectors').select('id,full_name,email,status').eq('id', req.body?.selectorId).maybeSingle();
  if (sErr) throw sErr;
  if (!selector?.email) throw ApiError.badRequest('Selector not found or has no email');

  const { error: insErr } = await supabase.from('trial_selectors').insert({
    trial_id: trial.trial_id, selector_id: selector.id, email: selector.email.trim().toLowerCase(), assigned_by: req.user?.id,
  });
  if (missingTable(insErr)) throw new ApiError(503, 'Selector assignment is not set up yet. Run the pending database migration.');
  if (insErr?.code === '23505') throw ApiError.badRequest('This selector is already assigned to the trial');
  if (insErr) throw insErr;

  // Tell the selector (PRD: notify on assignment)
  const when = new Date(`${trial.trial_date}T00:00:00`).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  emailService.sendEmail({
    to: selector.email,
    subject: `SSPL trial assignment: ${when}`,
    html: `<p>Hi ${String(selector.full_name || 'Selector').split(' ')[0]},</p>
<p>You are assigned as a selector for the SSPL trial on <strong>${when}</strong>${trial.trial_time ? ` at ${String(trial.trial_time).slice(0, 5)}` : ''}, at <strong>${venueOf(trial)}</strong>.</p>
<p>On the day, open <a href="${env.siteUrl}/selector">${env.siteUrl}/selector</a> on your phone, sign in with this email address (${selector.email}), and mark attendance and scores for each player.</p>
<p>Team SSPL</p>`,
  }).catch((err) => logger.warn(`Selector assignment email failed: ${err.message}`));

  res.json({ success: true });
};

/** DELETE /api/admin/trial-events/:id/selectors/:email */
export const unassignSelector = async (req, res) => {
  const { error } = await supabase.from('trial_selectors').delete()
    .eq('trial_id', req.params.id).eq('email', String(req.params.email).trim().toLowerCase());
  if (error) throw error;
  res.json({ success: true });
};

/* ------------------------------ Selector: scoring ------------------------------ */

/** Admins who manage trials can score any trial; selectors only the ones assigned to them. */
async function scoringAccess(req) {
  const email = norm(req.user?.email);
  const { data: role } = await supabase.from('user_roles').select('role,staff_role').eq('user_id', req.user.id).eq('role', 'admin').limit(1);
  const admin = role?.[0];
  if (admin && can(admin.staff_role || 'super_admin', 'manage_trials')) return { all: true, email };
  const { data, error } = await supabase.from('trial_selectors').select('trial_id').ilike('email', email);
  if (missingTable(error)) return { all: false, email, trialIds: new Set() };
  if (error) throw error;
  return { all: false, email, trialIds: new Set((data || []).map((r) => r.trial_id)) };
}

async function trialForScoring(req, trialId) {
  const access = await scoringAccess(req);
  if (!access.all && !access.trialIds.has(trialId)) throw ApiError.forbidden('You are not assigned to this trial');
  const { data: trial, error } = await supabase.from('trials').select('*').eq('trial_id', trialId).maybeSingle();
  if (error) throw error;
  if (!trial) throw ApiError.notFound('Trial not found');
  return trial;
}

/** GET /api/selector/trials — the signed-in selector's trials (all upcoming ones for trial admins). */
export const myTrials = async (req, res) => {
  const access = await scoringAccess(req);
  const since = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
  let query = supabase.from('trials').select('*').gte('trial_date', since).order('trial_date', { ascending: true });
  if (!access.all) {
    if (!access.trialIds.size) return res.json({ trials: [], admin: false });
    query = query.in('trial_id', [...access.trialIds]);
  }
  const { data, error } = await query;
  if (error) throw error;
  const trials = [];
  for (const t of data || []) {
    const allocations = await allocationsFor(t);
    trials.push({ trial_id: t.trial_id, name: t.trial_name, date: t.trial_date, time: t.trial_time, venue: venueOf(t), batch: t.trial_batch,
      booked: allocations.length, attended: allocations.filter((a) => a.attendance_status === 'attended').length,
      scored: allocations.filter((a) => a.selection_status && a.selection_status !== 'pending').length });
  }
  res.json({ trials, admin: access.all });
};

/** GET /api/selector/trials/:id/players */
export const trialPlayers = async (req, res) => {
  const trial = await trialForScoring(req, req.params.id);
  const allocations = await allocationsFor(trial);
  const ids = allocations.map((a) => a.workflow_id).filter(Boolean);
  const { data: workflows, error } = ids.length
    ? await supabase.from('player_workflow').select('workflow_id,full_name,city,registration_id').in('workflow_id', ids)
    : { data: [], error: null };
  if (error) throw error;
  const regIds = (workflows || []).map((w) => w.registration_id).filter(Boolean);
  const { data: regs } = regIds.length ? await supabase.from('player_registrations').select('id,position').in('id', regIds) : { data: [] };
  const position = new Map((regs || []).map((r) => [r.id, r.position]));
  const byWf = new Map((workflows || []).map((w) => [w.workflow_id, w]));
  res.json({
    trial: { trial_id: trial.trial_id, name: trial.trial_name, date: trial.trial_date, time: trial.trial_time, venue: venueOf(trial) },
    players: allocations.map((a) => {
      const w = byWf.get(a.workflow_id);
      return {
        allocationId: a.allocation_id,
        name: w?.full_name || 'Player',
        city: w?.city || null,
        position: w ? position.get(w.registration_id) || null : null,
        attendance: a.attendance_status || 'pending',
        batting: a.batting_score, bowling: a.bowling_score, fielding: a.fielding_score, overall: a.overall_score,
        decision: a.selection_status || 'pending',
        remarks: a.remarks,
      };
    }).sort((x, y) => x.name.localeCompare(y.name)),
  });
};

/** The allocation must belong to a trial the user may score. */
async function checkAllocation(req) {
  const { data: alloc, error } = await supabase.from('trials_allocations').select('allocation_id,allocation_date,allocation_venue').eq('allocation_id', req.params.allocationId).maybeSingle();
  if (error) throw error;
  if (!alloc) throw ApiError.notFound('Player booking not found');
  const access = await scoringAccess(req);
  if (access.all) return;
  const { data: trials } = await supabase.from('trials').select('*').in('trial_id', [...access.trialIds]);
  const ok = (trials || []).some((t) => t.trial_date === alloc.allocation_date && norm(venueOf(t)) === norm(alloc.allocation_venue));
  if (!ok) throw ApiError.forbidden('This player is not on one of your trials');
}

/** POST /api/selector/allocations/:allocationId/attendance  body: { status } — same rules as Step 4. */
export const markAttendance = async (req, res) => {
  await checkAllocation(req);
  return workflow.markAttendance({ ...req, body: { allocationId: req.params.allocationId, status: req.body?.status } }, res);
};

/** POST /api/selector/allocations/:allocationId/results  body: scores, selectionStatus, remarks — same rules as Step 4. */
export const saveResults = async (req, res) => {
  await checkAllocation(req);
  return workflow.saveResults({ ...req, body: { ...req.body, allocationId: req.params.allocationId } }, res);
};

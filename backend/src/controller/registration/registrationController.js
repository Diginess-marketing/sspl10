import supabase from '../../config/supabase.js';
import ApiError from '../../utils/ApiError.js';
import logger from '../../utils/logger.js';

const PAID = ['captured', 'paid', 'completed', 'success'];
const last10 = (v) => String(v ?? '').replace(/\D/g, '').slice(-10);
const sameEmail = (a, b) => String(a || '').trim().toLowerCase() === String(b || '').trim().toLowerCase();

// Fields a player may set on their own registration (everything else is server-controlled)
const FIELDS = [
  'full_name', 'email', 'phone', 'date_of_birth', 'state', 'city', 'town', 'pincode', 'position',
  'school_name', 'payment_amount', 'registration_type', 'preferred_trials',
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'qr_code_id', 'photo_url',
  'parent_name', 'parent_phone',
];

/** Age in whole years today from a YYYY-MM-DD date of birth, or null. */
export function ageOn(dob, today = new Date().toISOString().slice(0, 10)) {
  if (!/^\d{4}-\d{2}-\d{2}/.test(String(dob || ''))) return null;
  const [y, m, d] = String(dob).slice(0, 10).split('-').map(Number);
  const [ty, tm, td] = today.split('-').map(Number);
  return ty - y - (tm < m || (tm === m && td < d) ? 1 : 0);
}

const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 20;
const recent = new Map(); // ip -> timestamps (single instance; stops casual phone-number probing)

function rateLimited(ip) {
  const now = Date.now();
  const hits = (recent.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  recent.set(ip, hits);
  return hits.length > MAX_PER_WINDOW;
}

/** Individual registrations with this mobile (last 10 digits), newest first. */
async function findByPhone(phone) {
  const mobile = last10(phone);
  if (mobile.length !== 10) return [];
  const { data, error } = await supabase
    .from('player_registrations')
    .select('id,email,payment_status,team_id,created_at')
    .ilike('phone', `%${mobile}`)
    .order('created_at', { ascending: false })
    .limit(20);
  if (error) throw error;
  return data || [];
}

/**
 * Run a write, leaving out parent consent columns the live table does not have yet (they are
 * added by the pending migration). Any other missing column is a real error.
 */
async function withKnownColumns(values, write) {
  const row = Array.isArray(values) ? values.map((v) => ({ ...v })) : { ...values };
  const has = (col) => (Array.isArray(row) ? row.some((r) => col in r) : col in row);
  const drop = (col) => (Array.isArray(row) ? row.forEach((r) => delete r[col]) : delete row[col]);
  for (;;) {
    const { data, error } = await write(row);
    const missing = error?.code === 'PGRST204' && /the '([^']+)' column/.exec(error.message)?.[1];
    if (missing && ['parent_name', 'parent_phone', 'parent_consent_at'].includes(missing) && has(missing)) {
      logger.warn(`player_registrations has no ${missing} column yet; run the pending migration (parent consent not stored)`);
      drop(missing);
      continue;
    }
    if (error) throw error;
    return data;
  }
}

function pick(body) {
  const row = {};
  for (const f of FIELDS) if (body[f] !== undefined) row[f] = body[f] === '' ? null : body[f];
  return row;
}

/**
 * POST /api/registrations/individual  body: the registration form fields
 * Saves an individual registration without creating duplicates (PRD feature 4):
 * - this phone has already paid -> 409, the player is told they are registered
 * - an unpaid registration with the same phone AND email exists -> it is updated and reused
 * - otherwise a new pending registration is created
 * Returns { id, resumed }.
 */
export const saveIndividual = async (req, res) => {
  if (rateLimited(req.ip || 'unknown')) throw ApiError.badRequest('Too many attempts. Please try again later.');
  const row = pick(req.body || {});
  if (!row.full_name || !row.phone || !row.email) throw ApiError.badRequest('Name, phone and email are required');
  if (last10(row.phone).length !== 10) throw ApiError.badRequest('Enter a valid 10-digit mobile number');

  // Players under 18 need a parent or guardian's consent (PRD feature 14)
  const age = ageOn(row.date_of_birth);
  if (age !== null && age < 18) {
    if (!String(row.parent_name || '').trim() || last10(row.parent_phone).length !== 10 || req.body.parent_consent !== true) {
      throw ApiError.badRequest('Players under 18 need a parent or guardian: their name, mobile number and consent are required.');
    }
    row.parent_consent_at = new Date().toISOString();
  } else {
    delete row.parent_name;
    delete row.parent_phone;
  }

  const existing = await findByPhone(row.phone);
  if (existing.some((r) => PAID.includes(String(r.payment_status || '').toLowerCase()))) {
    throw new ApiError(409, 'This mobile number is already registered and paid. Check your status on the player dashboard, or contact us if you want to register someone else.');
  }

  const now = new Date().toISOString();
  const resumable = existing.find((r) => !r.team_id && sameEmail(r.email, row.email));
  if (resumable) {
    await withKnownColumns({ ...row, payment_status: 'pending', updated_at: now }, (values) =>
      supabase.from('player_registrations').update(values).eq('id', resumable.id));
    logger.info(`Registration ${resumable.id} resumed instead of creating a duplicate`);
    return res.json({ id: resumable.id, resumed: true });
  }

  const data = await withKnownColumns({ ...row, payment_status: 'pending' }, (values) =>
    supabase.from('player_registrations').insert(values).select('id').single());
  res.json({ id: data.id, resumed: false });
};

const TEAM_FIELDS = ['full_name', 'email', 'phone', 'date_of_birth', 'position', 'pincode'];
const MAX_TEAM_PLAYERS = 30;
const maskPhone = (p) => `${'•'.repeat(6)}${last10(p).slice(-4)}`;

/**
 * POST /api/registrations/team
 * body: { team: { team_name, state, city }, players: [{ full_name, email, phone, date_of_birth, position, pincode }],
 *         registration_type: 'team'|'students', payment_amount, utm_*, qr_code_id,
 *         guardian_name?, guardian_phone?, guardian_consent? }
 * Saves a team and its players in one go (PRD: a captain or parent registers several players
 * and pays once). A player whose phone has already paid is refused, and players under 18
 * need the registering adult's consent on behalf of their parents. Returns { teamId, captainId }.
 */
export const saveTeam = async (req, res) => {
  if (rateLimited(req.ip || 'unknown')) throw ApiError.badRequest('Too many attempts. Please try again later.');
  const body = req.body || {};
  const team = body.team || {};
  const players = Array.isArray(body.players) ? body.players : [];
  if (!String(team.team_name || '').trim()) throw ApiError.badRequest('Team name is required');
  if (players.length < 1 || players.length > MAX_TEAM_PLAYERS) throw ApiError.badRequest(`Add between 1 and ${MAX_TEAM_PLAYERS} players`);

  const phones = new Set();
  for (const [i, p] of players.entries()) {
    if (!p.full_name || !p.email || last10(p.phone).length !== 10) {
      throw ApiError.badRequest(`Player ${i + 1}: name, email and a 10-digit mobile are required`);
    }
    if (phones.has(last10(p.phone))) throw ApiError.badRequest(`Player ${i + 1} has the same mobile as another player in this team`);
    phones.add(last10(p.phone));
  }

  // Already registered and paid: stop before creating anything
  const paidClashes = [];
  for (const p of players) {
    const existing = await findByPhone(p.phone);
    if (existing.some((r) => PAID.includes(String(r.payment_status || '').toLowerCase()))) paidClashes.push(`${p.full_name} (${maskPhone(p.phone)})`);
  }
  if (paidClashes.length) {
    throw new ApiError(409, `Already registered and paid: ${paidClashes.join(', ')}. Remove them from the team, or contact us.`);
  }

  // Players under 18: the adult registering confirms their parents' consent
  const minors = players.filter((p) => { const a = ageOn(p.date_of_birth); return a !== null && a < 18; });
  if (minors.length && (!String(body.guardian_name || '').trim() || last10(body.guardian_phone).length !== 10 || body.guardian_consent !== true)) {
    throw ApiError.badRequest(`${minors.length} player(s) are under 18: the name and mobile of the parent or guardian giving consent are required, with the consent box ticked.`);
  }

  const now = new Date().toISOString();
  const { data: teamRow, error: teamErr } = await supabase.from('teams').insert({
    team_name: String(team.team_name).trim(),
    state: team.state || null,
    city: team.city || null,
    primary_contact_name: players[0].full_name,
    primary_contact_email: players[0].email,
    primary_contact_phone: players[0].phone,
    payment_amount: body.payment_amount ?? null,
    payment_status: 'pending',
  }).select('id').single();
  if (teamErr) throw teamErr;

  const perPlayer = body.payment_amount ? Number(body.payment_amount) / players.length : null;
  const rows = players.map((p, i) => {
    const row = {};
    for (const f of TEAM_FIELDS) if (p[f] !== undefined) row[f] = p[f] === '' ? null : p[f];
    const age = ageOn(p.date_of_birth);
    return {
      ...row,
      city: team.city || null,
      state: team.state || null,
      payment_amount: perPlayer,
      payment_status: 'pending',
      registration_type: body.registration_type === 'students' ? 'students' : 'team',
      team_id: teamRow.id,
      team: String(team.team_name).trim(),
      is_captain: i === 0,
      utm_source: body.utm_source || null,
      utm_medium: body.utm_medium || null,
      utm_campaign: body.utm_campaign || null,
      utm_content: body.utm_content || null,
      utm_term: body.utm_term || null,
      qr_code_id: body.qr_code_id || null,
      ...(age !== null && age < 18 && {
        parent_name: String(body.guardian_name).trim(),
        parent_phone: body.guardian_phone,
        parent_consent_at: now,
      }),
    };
  });

  const inserted = await withKnownColumns(rows, (values) =>
    supabase.from('player_registrations').insert(values).select('id,is_captain'));
  const captain = inserted.find((r) => r.is_captain) || inserted[0];
  res.json({ teamId: teamRow.id, captainId: captain.id });
};

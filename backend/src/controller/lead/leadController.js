import supabase from '../../config/supabase.js';
import ApiError from '../../utils/ApiError.js';

// Visitor follow-up call list (PRD 7.9): people who left their details but did not register
// (or registered and did not pay), with the campaign that brought them.

const PAID = ['captured', 'paid', 'completed', 'success'];
const last10 = (v) => String(v ?? '').replace(/\D/g, '').slice(-10);

async function fetchAll(table, select) {
  const rows = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase.from(table).select(select).order('created_at', { ascending: false }).range(from, from + 999);
    if (error) throw error;
    rows.push(...data);
    if (data.length < 1000) return rows;
  }
}

/**
 * GET /api/admin/leads?view=not_registered|unpaid|contacted|all&search=&page=1
 * One row per mobile (the newest lead), with what happened to them.
 */
export const list = async (req, res) => {
  const view = String(req.query.view || 'not_registered');
  const q = String(req.query.search || '').trim().toLowerCase();
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = 50;

  let leads;
  try {
    leads = await fetchAll('visitor_leads', 'id,created_at,name,email,phone,utm_source,utm_medium,utm_campaign,page_url,contacted_at,contacted_by,contact_notes');
  } catch (err) {
    if (!/contacted_|contact_notes/.test(err.message || '')) throw err;
    leads = await fetchAll('visitor_leads', 'id,created_at,name,email,phone,utm_source,utm_medium,utm_campaign,page_url');
  }
  const regs = await fetchAll('player_registrations', 'phone,email,payment_status,created_at');
  const regByPhone = new Map();
  for (const r of regs) {
    const m = last10(r.phone);
    if (m.length !== 10) continue;
    const prev = regByPhone.get(m);
    const paid = PAID.includes(String(r.payment_status || '').toLowerCase());
    regByPhone.set(m, { paid: Boolean(prev?.paid || paid) });
  }

  const seen = new Set();
  const rows = [];
  for (const l of leads) {
    const m = last10(l.phone);
    const key = m.length === 10 ? m : `id:${l.id}`;
    if (seen.has(key)) continue; // newest lead per mobile only
    seen.add(key);
    const reg = m.length === 10 ? regByPhone.get(m) : null;
    rows.push({ ...l, outcome: reg ? (reg.paid ? 'paid' : 'unpaid') : 'not_registered' });
  }

  const counts = {
    not_registered: rows.filter((r) => r.outcome === 'not_registered' && !r.contacted_at).length,
    unpaid: rows.filter((r) => r.outcome === 'unpaid' && !r.contacted_at).length,
    contacted: rows.filter((r) => r.contacted_at).length,
    all: rows.length,
  };
  const filtered = rows.filter((r) => (view === 'all' ? true : view === 'contacted' ? Boolean(r.contacted_at) : r.outcome === view && !r.contacted_at))
    .filter((r) => !q || [r.name, r.email, r.phone, r.utm_campaign].some((v) => String(v || '').toLowerCase().includes(q)));

  res.json({ counts, total: filtered.length, page, limit, data: filtered.slice((page - 1) * limit, page * limit) });
};

/** PATCH /api/admin/leads/:id  body: { contacted: boolean, notes? } */
export const update = async (req, res) => {
  const contacted = Boolean(req.body?.contacted);
  const { error } = await supabase.from('visitor_leads').update({
    contacted_at: contacted ? new Date().toISOString() : null,
    contacted_by: contacted ? req.user?.email || null : null,
    contact_notes: req.body?.notes === undefined ? undefined : String(req.body.notes || '').slice(0, 1000) || null,
  }).eq('id', req.params.id);
  if (error && /contacted_|contact_notes/.test(error.message)) throw new ApiError(503, 'Call tracking is not set up yet. Run the pending database migration.');
  if (error) throw error;
  res.json({ success: true });
};

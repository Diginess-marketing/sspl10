import crypto from 'crypto';
import supabase from '../../config/supabase.js';
import env from '../../config/env.js';
import ApiError from '../../utils/ApiError.js';

const PAID = ['captured', 'paid', 'completed', 'success'];
export const SOURCES = ['qr', 'whatsapp', 'fb', 'ig', 'partner', 'email', 'sms', 'offline'];
export const MEDIUMS = ['offline', 'paid', 'social', 'referral', 'broadcast'];
const last10 = (v) => String(v ?? '').replace(/\D/g, '').slice(-10);

// Partner links are signed so a partner can only open their own numbers
const linkSecret = () => process.env.PARTNER_LINK_SECRET || env.supabase?.key || 'sspl';
export const partnerKey = (code) => crypto.createHmac('sha256', linkSecret()).update(`partner:${code}`).digest('hex').slice(0, 24);
const partnerPath = (code) => `/partner/${encodeURIComponent(code)}?k=${partnerKey(code)}`;

/** "divya  saravanan", "Divya_Saravanan" -> "Divya-Saravanan" (PRD 7.4: one naming rule) */
export function campaignName(...parts) {
  return parts
    .flatMap((p) => String(p || '').split(/[\s_-]+/))
    .filter(Boolean)
    .map((w) => (/^\d+$/.test(w) ? w : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
    .join('-');
}
const comparable = (name) => String(name || '').toLowerCase().replace(/[^a-z0-9]/g, '');

async function fetchAll(table, select) {
  const rows = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase.from(table).select(select).order('id').range(from, from + 999);
    if (error) throw error;
    rows.push(...data);
    if (data.length < 1000) return rows;
  }
}

function paramsOf(url) {
  try {
    const u = new URL(url);
    return { source: (u.searchParams.get('utm_source') || '').toLowerCase(), campaign: u.searchParams.get('utm_campaign') || '' };
  } catch {
    return { source: '', campaign: '' };
  }
}

/**
 * Funnel for each QR code / campaign link (PRD 7.6): sign-ups, paid sign-ups, revenue and
 * selected players. A registration counts for a code when it carries the code, or when its
 * source and campaign match the code's link.
 */
async function funnel(codes) {
  const [regs, candidates, progress] = await Promise.all([
    fetchAll('player_registrations', 'id,phone,qr_code_id,utm_source,utm_campaign,payment_status,amount_paid,payment_amount'),
    fetchAll('trial_candidates', 'id,registration_id,mobile'),
    fetchAll('trial_progress', 'id,candidate_id,final_status'),
  ]);
  const selectedCandidates = new Set(progress.filter((p) => String(p.final_status).toUpperCase() === 'SELECTED').map((p) => p.candidate_id));
  const selectedRegs = new Set();
  const selectedPhones = new Set();
  for (const c of candidates) {
    if (!selectedCandidates.has(c.id)) continue;
    if (c.registration_id) selectedRegs.add(c.registration_id);
    if (last10(c.mobile).length === 10) selectedPhones.add(last10(c.mobile));
  }

  const byCode = new Map(codes.map((c) => [c.code, { signups: 0, paid: 0, revenue: 0, selected: 0 }]));
  const byLink = new Map();
  for (const c of codes) {
    const p = paramsOf(c.target_url);
    const key = `${p.source}|${comparable(p.campaign)}`;
    if (!byLink.has(key)) byLink.set(key, c.code);
  }
  let unknown = 0;

  for (const r of regs) {
    if (!r.utm_source && !r.utm_campaign && !r.qr_code_id) unknown += 1;
    const code = (r.qr_code_id && byCode.has(r.qr_code_id) ? r.qr_code_id : null)
      || byLink.get(`${String(r.utm_source || '').toLowerCase()}|${comparable(r.utm_campaign)}`);
    if (!code) continue;
    const s = byCode.get(code);
    s.signups += 1;
    if (PAID.includes(String(r.payment_status || '').toLowerCase())) {
      s.paid += 1;
      s.revenue += Number(r.amount_paid ?? r.payment_amount ?? 0) || 0;
      if (selectedRegs.has(r.id) || selectedPhones.has(last10(r.phone))) s.selected += 1;
    }
  }
  return { byCode, unknown, totalRegistrations: regs.length };
}

/** GET /api/admin/campaigns/qr — every code with its funnel, plus the "Unknown source" count. */
export const listQr = async (req, res) => {
  const { data: codes, error } = await supabase.from('sspl_qr_codes')
    .select('id,code,title,description,target_url,is_active,current_scans,tags,created_at,metadata')
    .order('created_at', { ascending: false });
  if (error) throw error;
  const { byCode, unknown, totalRegistrations } = await funnel(codes);
  res.json({
    unknownSource: unknown,
    totalRegistrations,
    sources: SOURCES,
    mediums: MEDIUMS,
    data: codes.map((c) => ({
      ...c,
      ...paramsOf(c.target_url),
      oldDomain: /sspl10\.com/i.test(c.target_url || ''),
      partnerPath: partnerPath(c.code),
      ...byCode.get(c.code),
    })),
  });
};

/**
 * POST /api/admin/campaigns/qr  body: { person, region?, source, medium, notes? }
 * Creates a QR code for a partner or campaign in one step (PRD 7.1). The name follows one
 * rule ("Person-Region"), and a name that already exists in another spelling is refused.
 */
export const createQr = async (req, res) => {
  const { person, region, source = 'qr', medium = 'offline', notes } = req.body || {};
  if (!String(person || '').trim()) throw ApiError.badRequest('Enter the person or campaign name');
  if (!SOURCES.includes(source)) throw ApiError.badRequest(`Source must be one of ${SOURCES.join(', ')}`);
  if (!MEDIUMS.includes(medium)) throw ApiError.badRequest(`Medium must be one of ${MEDIUMS.join(', ')}`);
  const name = campaignName(person, region);

  const { data: existing, error } = await supabase.from('sspl_qr_codes').select('code,title,target_url');
  if (error) throw error;
  const clash = existing.find((c) => comparable(c.title) === comparable(name) || comparable(paramsOf(c.target_url).campaign) === comparable(name));
  if (clash) throw new ApiError(409, `A campaign called "${clash.title}" already exists (code ${clash.code}). Use it, or add a different region.`);

  const code = `${name.toUpperCase()}-${existing.length + 1}`;
  const url = new URL('/register', env.siteUrl);
  url.searchParams.set('utm_source', source);
  url.searchParams.set('utm_medium', medium);
  url.searchParams.set('utm_campaign', name);

  const { data, error: insErr } = await supabase.from('sspl_qr_codes').insert({
    code,
    title: name,
    description: String(notes || '').slice(0, 500) || null,
    target_url: url.toString(),
    is_active: true,
    current_scans: 0,
    tags: [source, medium, String(region || '').trim()].filter(Boolean),
    created_by: req.user?.id,
    metadata: { person: String(person).trim(), region: String(region || '').trim() || null, source, medium },
  }).select('*').single();
  if (insErr) throw insErr;
  res.json({ ...data, ...paramsOf(data.target_url), partnerPath: partnerPath(code), signups: 0, paid: 0, revenue: 0, selected: 0 });
};

/** PATCH /api/admin/campaigns/qr/:code  body: { is_active } — switch a code on or off. */
export const updateQr = async (req, res) => {
  const { error } = await supabase.from('sspl_qr_codes')
    .update({ is_active: Boolean(req.body?.is_active), updated_at: new Date().toISOString() }).eq('code', req.params.code);
  if (error) throw error;
  res.json({ success: true });
};

/** GET /api/partner/:code?k=  — a partner's own numbers (PRD 7.5); no personal data. */
export const partnerStats = async (req, res) => {
  const code = String(req.params.code || '');
  const key = String(req.query.k || '');
  const expected = partnerKey(code);
  if (key.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(key), Buffer.from(expected))) {
    throw ApiError.notFound('This partner link is not valid');
  }
  const { data: qr, error } = await supabase.from('sspl_qr_codes')
    .select('code,title,target_url,current_scans,created_at,metadata').eq('code', code).maybeSingle();
  if (error) throw error;
  if (!qr) throw ApiError.notFound('This partner link is not valid');
  const { byCode } = await funnel([qr]);
  const s = byCode.get(qr.code);
  res.json({
    name: qr.metadata?.person || qr.title,
    region: qr.metadata?.region || null,
    since: qr.created_at,
    scans: qr.current_scans || 0,
    signups: s.signups,
    paid: s.paid,
    updatedAt: new Date().toISOString(),
  });
};

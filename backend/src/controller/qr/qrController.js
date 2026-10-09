import supabase from '../../config/supabase.js';
import ApiError from '../../utils/ApiError.js';
import logger from '../../utils/logger.js';

const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 60;
const recent = new Map(); // ip -> timestamps (single instance; stops casual inflation of counts)

function rateLimited(ip) {
  const now = Date.now();
  const hits = (recent.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  recent.set(ip, hits);
  return hits.length > MAX_PER_WINDOW;
}

const clean = (v, max = 120) => String(v ?? '').trim().slice(0, max);
const deviceOf = (ua) => (/ipad|tablet/i.test(ua) ? 'tablet' : /mobi|android|iphone/i.test(ua) ? 'mobile' : 'desktop');

/** The QR code a visit belongs to: by its code, else by the source + campaign in its link. */
async function findQrCode({ code, source, campaign }) {
  if (code) {
    const { data, error } = await supabase.from('sspl_qr_codes').select('id,code,current_scans').eq('code', code).maybeSingle();
    if (error) throw error;
    if (data) return data;
  }
  if (!campaign) return null;
  let query = supabase.from('sspl_qr_codes').select('id,code,current_scans')
    .ilike('target_url', `%utm_campaign=${campaign.replace(/[%_]/g, '\$&')}%`)
    .eq('is_active', true);
  if (source) query = query.ilike('target_url', `%utm_source=${source.replace(/[%_]/g, '\$&')}&%`);
  const { data, error } = await query.order('created_at', { ascending: false }).limit(1);
  if (error) throw error;
  return data?.[0] ?? null;
}

/**
 * POST /api/qr/scan  body: { code?, utm_source?, utm_campaign?, referrer?, via: 'qr_page'|'link' }
 * Counts a QR scan (PRD 7.3), also when the code's link opens /register directly.
 * Returns { code } so the registration can be credited to that QR code, or { code: null }.
 */
export const recordScan = async (req, res) => {
  if (rateLimited(req.ip || 'unknown')) throw ApiError.badRequest('Too many requests');
  const body = req.body || {};
  const qr = await findQrCode({ code: clean(body.code), source: clean(body.utm_source), campaign: clean(body.utm_campaign) });
  if (!qr) return res.json({ code: null });

  const userAgent = clean(req.get('user-agent'), 400);
  const { error } = await supabase.from('sspl_qr_analytics').insert({
    qr_code_id: qr.id,
    ip_address: clean(req.ip, 64),
    user_agent: userAgent,
    referrer: clean(body.referrer, 300),
    scan_source: `${body.via === 'qr_page' ? 'qr_page' : 'link'}:${deviceOf(userAgent)}`,
    scanned_at: new Date().toISOString(),
  });
  if (error) logger.warn(`QR scan not stored for ${qr.code}: ${error.message}`);

  // The running total shown in the admin (read-modify-write is close enough for a counter)
  const { error: countErr } = await supabase.from('sspl_qr_codes')
    .update({ current_scans: (qr.current_scans || 0) + 1 }).eq('id', qr.id);
  if (countErr) logger.warn(`QR scan count not updated for ${qr.code}: ${countErr.message}`);

  res.json({ code: qr.code });
};

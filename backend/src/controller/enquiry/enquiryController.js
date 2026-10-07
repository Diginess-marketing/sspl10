import supabase from '../../config/supabase.js';
import env from '../../config/env.js';
import ApiError from '../../utils/ApiError.js';
import logger from '../../utils/logger.js';
import * as emailService from '../../service/emailService.js';

// Public contact / sponsor / franchise enquiries. Previously the site form only pretended to
// send (a timed "success"); enquiries now reach the SSPL mailbox and are stored as leads.

const TYPES = { sponsor: 'Sponsorship', franchise: 'Franchise', other: 'General' };
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const recent = new Map(); // ip -> timestamps (single instance; enough to stop casual spam)

const escapeHtml = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function rateLimited(ip) {
  const now = Date.now();
  const hits = (recent.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  recent.set(ip, hits);
  return hits.length > MAX_PER_WINDOW;
}

function validate(body = {}) {
  const name = String(body.name || '').trim();
  const phone = String(body.phone || '').replace(/[^\d+]/g, '');
  const email = String(body.email || '').trim();
  const interestType = String(body.interestType || 'other');
  const message = String(body.message || '').trim();
  const organisation = String(body.organisation || '').trim().slice(0, 120);
  if (name.length < 2 || name.length > 100) throw ApiError.badRequest('Please enter your name');
  if (!/^\+?\d{10,13}$/.test(phone)) throw ApiError.badRequest('Please enter a valid phone number');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw ApiError.badRequest('Please enter a valid email');
  if (!TYPES[interestType]) throw ApiError.badRequest('Unknown enquiry type');
  if (message.length > 2000) throw ApiError.badRequest('Message is too long');
  return { name, phone, email, interestType, message, organisation };
}

/** POST /api/enquiries */
export const createEnquiry = async (req, res) => {
  // Hidden field real visitors never fill
  if (req.body?.website) {
    res.json({ ok: true });
    return;
  }
  if (rateLimited(req.ip || 'unknown')) throw ApiError.badRequest('Too many enquiries. Please try again later or WhatsApp us.');

  const e = validate(req.body);
  const to = process.env.ENQUIRY_TO_EMAIL || env.msGraph.fromEmail;

  const html = `<p>New <strong>${escapeHtml(TYPES[e.interestType])}</strong> enquiry from the website.</p>
<table cellpadding="6" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">
<tr><td><b>Name</b></td><td>${escapeHtml(e.name)}</td></tr>
${e.organisation ? `<tr><td><b>Organisation</b></td><td>${escapeHtml(e.organisation)}</td></tr>` : ''}
<tr><td><b>Phone</b></td><td>${escapeHtml(e.phone)}</td></tr>
<tr><td><b>Email</b></td><td>${escapeHtml(e.email)}</td></tr>
<tr><td valign="top"><b>Message</b></td><td>${escapeHtml(e.message).replace(/\n/g, '<br>') || '—'}</td></tr>
</table>`;

  const [mail, lead] = await Promise.all([
    to
      ? emailService.sendEmail({ to, subject: `Website enquiry – ${TYPES[e.interestType]} – ${e.name}`, html })
      : Promise.resolve({ success: false, error: 'No enquiry mailbox configured' }),
    supabase.from('leads').insert({ name: e.name, phone: e.phone, email: e.email, source: `enquiry_${e.interestType}` }),
  ]);

  if (!mail.success) logger.warn('Enquiry email not sent:', mail.error);
  if (lead.error) logger.warn('Enquiry lead not stored:', lead.error.message);
  if (!mail.success && lead.error) {
    throw ApiError.internal('Could not send your enquiry. Please WhatsApp us on +91 88077 75960.');
  }
  res.json({ ok: true });
};

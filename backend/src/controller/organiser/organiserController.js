import supabase from '../../config/supabase.js';
import env from '../../config/env.js';
import ApiError from '../../utils/ApiError.js';
import logger from '../../utils/logger.js';
import * as emailService from '../../service/emailService.js';

// Tournament organisers: approval with a welcome message, kit dispatch tracking and event
// results (PRD section 6 "Organisers" and feature 15).

const STATUSES = ['pending', 'approved', 'rejected'];
const KIT = ['approved', 'packed', 'dispatched', 'delivered'];
const KIT_TEXT = {
  approved: 'Your SSPL branding kit has been approved and will be packed soon.',
  packed: 'Your SSPL branding kit is packed and will be dispatched shortly.',
  dispatched: 'Your SSPL branding kit has been dispatched.',
  delivered: 'Your SSPL branding kit is marked as delivered. Tell us if anything is missing.',
};

const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function mail(to, subject, paragraphs) {
  if (!to || !String(to).includes('@')) return;
  emailService.sendEmail({ to, subject, html: paragraphs.map((p) => `<p>${p}</p>`).join('') })
    .then((r) => { if (!r.success) logger.warn(`Organiser email to ${to} failed: ${r.error}`); })
    .catch((err) => logger.warn(`Organiser email to ${to} failed: ${err.message}`));
}

/**
 * PATCH /api/admin/organizers/:id  body: { status?, kit_status?, kit_tracking?, event_results? }
 * Approving sends a welcome email; each kit step tells the organiser where their kit is.
 */
export const update = async (req, res) => {
  const { data: org, error } = await supabase.from('tournament_organizers').select('*').eq('id', req.params.id).maybeSingle();
  if (error) throw error;
  if (!org) throw ApiError.notFound('Organiser not found');

  const body = req.body || {};
  const changes = {};
  if (body.status !== undefined) {
    if (!STATUSES.includes(body.status)) throw ApiError.badRequest('Unknown status');
    changes.status = body.status;
  }
  if (body.kit_status !== undefined) {
    if (body.kit_status !== null && !KIT.includes(body.kit_status)) throw ApiError.badRequest('Unknown kit status');
    if ((changes.status || org.status) !== 'approved') throw ApiError.badRequest('Approve the organiser before tracking their kit');
    changes.kit_status = body.kit_status;
    changes.kit_updated_at = new Date().toISOString();
  }
  if (body.kit_tracking !== undefined) changes.kit_tracking = String(body.kit_tracking || '').slice(0, 200) || null;
  if (body.event_results !== undefined) changes.event_results = String(body.event_results || '').slice(0, 5000) || null;
  if (!Object.keys(changes).length) throw ApiError.badRequest('Nothing to change');

  const { data: saved, error: upErr } = await supabase.from('tournament_organizers').update(changes).eq('id', org.id).select('*').single();
  if (upErr && /kit_|event_results/.test(upErr.message)) throw new ApiError(503, 'Kit tracking is not set up yet. Run the pending database migration.');
  if (upErr) throw upErr;

  const first = esc(String(org.organiser_name || 'Organiser').split(' ')[0]);
  if (changes.status === 'approved' && org.status !== 'approved') {
    mail(org.email, 'Welcome to SSPL as a tournament organiser', [
      `Hi ${first},`,
      `Your application for <strong>${esc(org.organisation_name)}</strong> is approved. Welcome to the SSPL organiser network.`,
      'Our team will contact you about branding support and your kit. You will get an email at each step of the kit dispatch.',
      `Team SSPL · <a href="${env.siteUrl}">${env.siteUrl}</a>`,
    ]);
  }
  if (changes.kit_status && changes.kit_status !== org.kit_status) {
    const tracking = changes.kit_tracking ?? org.kit_tracking;
    mail(org.email, `SSPL kit update: ${changes.kit_status}`, [
      `Hi ${first},`,
      KIT_TEXT[changes.kit_status],
      ...(tracking && changes.kit_status === 'dispatched' ? [`Tracking: <strong>${esc(tracking)}</strong>`] : []),
      'Team SSPL',
    ]);
  }
  res.json(saved);
};

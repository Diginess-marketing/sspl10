import env from '../config/env.js';
import * as emailTemplateModel from '../model/emailTemplateModel.js';
import * as emailLogModel from '../model/emailLogModel.js';
import * as emailService from './emailService.js';
import * as whatsappService from './whatsappService.js';
import { renderTemplate } from './emailTemplateService.js';
import logger from '../utils/logger.js';

// Automatic player messages at each stage of the journey (PRD feature 2): an email, and a
// WhatsApp message when an approved template is configured for that stage.
//
// The email wording comes from Admin > Emails when a template with the stage's key exists
// (and is switched on); otherwise the built-in wording below is used. WhatsApp templates
// are named in the server env, e.g. WHATSAPP_TEMPLATE_TRIAL_SLOT_ALLOCATED=sspl_trial_slot.

const DEFAULTS = {
  trial_slot_allocated: {
    subject: 'Your SSPL trial: {{trial_date}} at {{venue}}',
    body_html: `<p>Hi {{first_name}},</p>
<p>Your SSPL trial is booked.</p>
<table style="border-collapse:collapse;margin:12px 0">
<tr><td style="padding:4px 12px 4px 0;color:#55607a">Date</td><td style="padding:4px 0"><strong>{{trial_date}}</strong></td></tr>
<tr><td style="padding:4px 12px 4px 0;color:#55607a">Time</td><td style="padding:4px 0"><strong>{{trial_time}}</strong></td></tr>
<tr><td style="padding:4px 12px 4px 0;color:#55607a">Venue</td><td style="padding:4px 0"><strong>{{venue}}</strong></td></tr>
<tr><td style="padding:4px 12px 4px 0;color:#55607a">Batch</td><td style="padding:4px 0">{{batch}}</td></tr>
</table>
<p>Please arrive 30 minutes early in sports kit, with a photo ID. Your status is always on your player dashboard: <a href="{{site_url}}/dashboard">{{site_url}}/dashboard</a>.</p>
<p>All the best,<br>Team SSPL</p>`,
    whatsappParams: (v) => [v.first_name, v.trial_date, v.trial_time, v.venue],
  },
  payment_reminder_2: {
    subject: 'Your SSPL registration is waiting for payment',
    body_html: `<p>Hi {{first_name}},</p>
<p>You started your SSPL registration yesterday but the payment did not go through, so your trial slot is not confirmed yet.</p>
<p>It takes two minutes to finish: <a href="{{register_url}}">{{register_url}}</a></p>
<p>If you already paid, reply to this email with your payment reference and we will sort it out.</p>
<p>Team SSPL</p>`,
    whatsappParams: (v) => [v.first_name, v.register_url],
  },
  payment_reminder: {
    whatsappParams: (v) => [v.first_name, v.register_url],
  },
};

const waTemplateFor = (stage) => process.env[`WHATSAPP_TEMPLATE_${stage.toUpperCase()}`];
const toWhatsAppNumber = (phone) => {
  const digits = String(phone || '').replace(/\D/g, '');
  return digits.length >= 10 ? `91${digits.slice(-10)}` : null;
};

async function templateFor(stage) {
  try {
    const stored = await emailTemplateModel.findByKey(stage);
    if (stored) return stored.enabled === false ? null : stored;
  } catch (err) {
    // email_templates not created yet (pending migration): fall back to the built-in wording
    if (err?.code !== 'PGRST205') logger.warn(`Template lookup for ${stage} failed: ${err.message}`);
  }
  return DEFAULTS[stage]?.body_html ? { key: stage, ...DEFAULTS[stage] } : null;
}

/**
 * Tell a player about a stage.
 * @param {string} stage e.g. 'trial_slot_allocated', 'payment_reminder_2'
 * @param {{name?:string, email?:string, phone?:string, registrationId?:string, values?:Object, emailOnly?:boolean, whatsappOnly?:boolean}} player
 * @returns {Promise<{email:string, whatsapp:string}>} what happened on each channel
 */
export async function notifyPlayer(stage, { name, email, phone, registrationId, values = {}, emailOnly = false, whatsappOnly = false }) {
  const fullName = String(name || 'Player').trim();
  const v = {
    name: fullName,
    first_name: fullName.split(/\s+/)[0],
    site_url: env.siteUrl,
    register_url: `${env.siteUrl}/register`,
    ...values,
  };
  const outcome = { email: 'skipped', whatsapp: 'skipped' };

  const template = whatsappOnly ? null : await templateFor(stage);
  if (template && email && email.includes('@')) {
    const { subject, html } = renderTemplate(template, v);
    const result = await emailService.sendEmail({ to: email, subject, html });
    outcome.email = result.success ? 'sent' : 'failed';
    await emailLogModel.insert({
      recipientEmail: email,
      recipientName: fullName,
      type: stage,
      success: result.success,
      error: result.error,
      registrationId,
    }).catch((err) => logger.warn(`Email log insert failed: ${err.message}`));
  }

  const waTemplate = waTemplateFor(stage);
  const waNumber = toWhatsAppNumber(phone);
  if (!emailOnly && waTemplate && waNumber && whatsappService.isConfigured()) {
    try {
      const params = DEFAULTS[stage]?.whatsappParams?.(v) || [v.first_name];
      await whatsappService.sendTemplate(waNumber, waTemplate, params);
      outcome.whatsapp = 'sent';
    } catch (err) {
      outcome.whatsapp = 'failed';
      logger.warn(`WhatsApp ${stage} to ${waNumber} failed: ${err.response?.data?.error?.message || err.message}`);
    }
  }
  return outcome;
}

/** Fire-and-forget form for request handlers: messaging must never fail the action itself. */
export function notifyPlayerLater(stage, player) {
  notifyPlayer(stage, player).catch((err) => logger.error(`Player message ${stage} failed:`, err));
}

const fmtDate = (d) => (d ? new Date(`${String(d).slice(0, 10)}T00:00:00`).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' }) : 'to be confirmed');

/** Values for the trial slot message from a trials_allocations row. */
export const slotValues = (slot) => ({
  trial_date: fmtDate(slot.allocation_date),
  trial_time: slot.allocation_time ? String(slot.allocation_time).slice(0, 5) : 'to be confirmed',
  venue: slot.allocation_venue || 'to be confirmed',
  batch: slot.allocation_batch || '—',
});

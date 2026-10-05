import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import env from '../config/env.js';

// The logo travels inside the email as an inline attachment (cid:), so it shows even when
// the website's copy moves (ssplt10.co.in returned 404 for the hosted logo URL).
const LOGO_CID = 'sspl-logo';
const LOGO_BYTES = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), '../../assets/sspl-logo.png'));

/** Inline logo attachment that every layout-wrapped email must carry. */
export const logoAttachment = () => ({
  name: 'sspl-logo.png',
  contentType: 'image/png',
  contentBytes: LOGO_BYTES.toString('base64'),
  isInline: true,
  contentId: LOGO_CID,
});

/** data: URI of the logo, for in-browser previews (cid: only resolves inside an email). */
export const LOGO_DATA_URI = `data:image/png;base64,${LOGO_BYTES.toString('base64')}`;

// Placeholders the composer offers; values are HTML-escaped before substitution.
export const PLACEHOLDERS = {
  name: 'Player full name',
  first_name: 'Player first name',
  level: 'Trial level (1-5)',
  next_level: 'Next level number',
  phone: 'Player mobile',
  email: 'Player email',
  city: 'Player city',
  certificate_no: 'Certificate number',
  results_url: 'Link to the results page',
  site_url: 'Website address',
};

export const TRIAL_OUTCOMES = ['selected', 'not_selected', 'absent'];
export const trialTemplateKey = (level, outcome) => `trial_l${level}_${outcome}`;

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

/** Replace {{placeholders}}; unknown ones are left as-is so typos are visible in the test email. */
export function fillPlaceholders(text, values, { html = true } = {}) {
  return String(text || '').replace(/\{\{\s*([a-z_]+)\s*\}\}/g, (match, key) => {
    if (!(key in values)) return match;
    return html ? escapeHtml(values[key]) : String(values[key] ?? '');
  });
}

/** Placeholder values for a candidate at a level. */
export function trialPlaceholderValues({ name, phone, email, city, level, certificateNo }) {
  const fullName = (name || 'Player').trim();
  return {
    name: fullName,
    first_name: fullName.split(/\s+/)[0],
    level: String(level ?? ''),
    next_level: level ? String(Math.min(Number(level) + 1, 5)) : '',
    phone: phone || '',
    email: email || '',
    city: city || '',
    certificate_no: certificateNo || '',
    results_url: `${env.siteUrl}/trial-results`,
    site_url: env.siteUrl,
  };
}

/**
 * Sample values for previews and test sends, matching the template's level and outcome
 * (trial_l3_not_selected -> level 3, participation certificate number).
 */
export function sampleValuesFor(key = '') {
  const match = /^trial_l([1-5])_(selected|not_selected|absent)$/.exec(key);
  const level = match ? Number(match[1]) : 2;
  const outcome = match ? match[2] : 'selected';
  const kindLetter = outcome === 'not_selected' ? 'P' : 'A';
  return trialPlaceholderValues({
    name: 'Ravi Kumar',
    phone: '98765 43210',
    email: 'player@example.com',
    city: 'Chennai',
    level,
    certificateNo: outcome === 'absent' ? '' : `SSPL-L${level}-${kindLetter}-SAMPLE`,
  });
}

export const SAMPLE_VALUES = sampleValuesFor();

/**
 * Wrap composer HTML in the branded email layout (table-based, inline styles,
 * so it renders in Outlook and Gmail).
 */
export function wrapInLayout(bodyHtml, { logoSrc = `cid:${LOGO_CID}` } = {}) {
  const logo = logoSrc;
  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#eef2fb;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef2fb;padding:24px 12px;">
<tr><td align="center">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;font-family:Arial,Helvetica,sans-serif;color:#0a1240;">
    <tr><td style="background:#001b69;padding:20px 28px;" align="left">
      <img src="${logo}" alt="SSPL" height="56" style="display:block;height:56px;border:0;">
    </td></tr>
    <tr><td style="height:4px;background:#dffc35;line-height:4px;font-size:0;">&nbsp;</td></tr>
    <tr><td style="padding:28px;font-size:15px;line-height:1.6;">${bodyHtml}</td></tr>
    <tr><td style="padding:18px 28px;background:#f5f7fc;font-size:12px;line-height:1.5;color:#55607a;">
      Southern Street Premier League &middot; <a href="${env.siteUrl}" style="color:#1f57d6;">${env.siteUrl.replace(/^https?:\/\//, '')}</a><br>
      WhatsApp support: +91 88077 75960 (10:00 AM – 7:00 PM)
    </td></tr>
  </table>
</td></tr>
</table>
</body></html>`;
}

/** Subject + full HTML for a template and placeholder values. */
export function renderTemplate(template, values, layoutOptions) {
  return {
    subject: fillPlaceholders(template.subject, values, { html: false }),
    html: wrapInLayout(fillPlaceholders(template.body_html, values), layoutOptions),
  };
}

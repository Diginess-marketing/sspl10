import env from '../config/env.js';

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

/** Sample values used for previews and test sends. */
export const SAMPLE_VALUES = trialPlaceholderValues({
  name: 'Ravi Kumar',
  phone: '98765 43210',
  email: 'player@example.com',
  city: 'Chennai',
  level: 2,
  certificateNo: 'SSPL-L2-A-SAMPLE',
});

/**
 * Wrap composer HTML in the branded email layout (table-based, inline styles,
 * so it renders in Outlook and Gmail).
 */
export function wrapInLayout(bodyHtml) {
  const logo = `${env.siteUrl}/assets/img/sspl-logo-color.png`;
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
export function renderTemplate(template, values) {
  return {
    subject: fillPlaceholders(template.subject, values, { html: false }),
    html: wrapInLayout(fillPlaceholders(template.body_html, values)),
  };
}

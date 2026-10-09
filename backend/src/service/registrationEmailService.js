import supabase from '../config/supabase.js';
import * as emailTemplateModel from '../model/emailTemplateModel.js';
import * as emailLogModel from '../model/emailLogModel.js';
import * as emailService from './emailService.js';
import { fillPlaceholders, logoAttachment, trialPlaceholderValues, wrapInLayout } from './emailTemplateService.js';
import { generateInvoicePdf } from './invoiceService.js';
import logger from '../utils/logger.js';

// Registration confirmation (payment received). Sent by the backend through Microsoft 365;
// replaces the send-confirmation-mail Edge Function, which is not deployed (404).

export const CONFIRMATION_KEY = 'registration_confirmation';

// Used until the template exists in email_templates (then it is edited in Admin → Emails)
export const DEFAULT_CONFIRMATION_TEMPLATE = {
  key: CONFIRMATION_KEY,
  name: 'Registration confirmation',
  subject: 'Welcome to SSPL, {{first_name}} – your registration is confirmed',
  body_html:
    '<p>Dear {{name}},</p>'
    + '<p>Thank you for registering for the <strong>Southern Street Premier League</strong> trials. We have received your payment.</p>'
    + '<ul><li>Amount paid: <strong>₹{{amount}}</strong></li><li>Payment ID: {{payment_id}}</li><li>Registration ID: {{registration_id}}</li></ul>'
    + '<p>Our team will contact you on {{phone}} with your trial venue, date and time.</p>'
    + '<p>You can check your trial results any time at <a href="{{results_url}}">{{results_url}}</a>.</p>'
    + '<p>All the best,<br>Team SSPL</p>',
  enabled: true,
};

async function loadTemplate() {
  try {
    return (await emailTemplateModel.findByKey(CONFIRMATION_KEY)) || DEFAULT_CONFIRMATION_TEMPLATE;
  } catch {
    // email_templates not created yet (migration pending): use the built-in copy
    return DEFAULT_CONFIRMATION_TEMPLATE;
  }
}

/** Placeholder values for a registration. */
export function confirmationValues(registration, { amount, paymentId } = {}) {
  return {
    ...trialPlaceholderValues({
      name: registration.full_name || (registration.email || '').split('@')[0],
      phone: registration.phone,
      email: registration.email,
      city: registration.city,
    }),
    amount: Number(amount || 0).toLocaleString('en-IN'),
    payment_id: paymentId || registration.razorpay_payment_id || '',
    registration_id: registration.id,
  };
}

/**
 * Email the registration confirmation and record it.
 * @returns {Promise<{success:boolean, skipped?:boolean, error?:string}>}
 */
export async function sendRegistrationConfirmation(registration, { amount, paymentId } = {}) {
  if (!registration?.email) return { success: false, skipped: true, error: 'No email address on file' };

  const template = await loadTemplate();
  if (template.enabled === false) return { success: false, skipped: true, error: 'Template is switched off' };

  const values = confirmationValues(registration, { amount, paymentId });
  const subject = fillPlaceholders(template.subject, values, { html: false });
  const html = wrapInLayout(fillPlaceholders(template.body_html, values));
  const attachments = [logoAttachment()];
  // GST invoice / receipt for the payment (PRD feature 12); the email still goes if it fails
  if (values.payment_id && Number(amount) > 0) {
    try {
      const invoice = await generateInvoicePdf({
        paymentId: values.payment_id,
        amount: Number(amount),
        buyer: { name: registration.full_name, email: registration.email, phone: registration.phone, state: registration.state, city: registration.city },
      });
      attachments.push({ name: `${invoice.isTaxInvoice ? 'SSPL-Tax-Invoice' : 'SSPL-Receipt'}-${values.payment_id}.pdf`, contentType: 'application/pdf', contentBytes: invoice.pdf.toString('base64') });
    } catch (err) {
      logger.warn('Invoice not attached:', err.message);
    }
  }
  const result = await emailService.sendEmail({ to: registration.email, subject, html, attachments });

  let logId = null;
  try {
    const log = await emailLogModel.insert({
      recipientEmail: registration.email,
      recipientName: registration.full_name,
      type: CONFIRMATION_KEY,
      success: result.success,
      error: result.error,
      registrationId: registration.id,
      paymentId: values.payment_id || undefined,
    });
    logId = log?.id ?? null;
  } catch (err) {
    logger.warn('email_logs insert failed:', err.message);
  }

  if (result.success) {
    // Shows "email sent" on the admin Registrations list
    const { error } = await supabase
      .from('player_workflow')
      .update({ confirmation_email_sent: true, confirmation_email_sent_at: new Date().toISOString(), ...(logId ? { confirmation_email_log_id: logId } : {}) })
      .eq('registration_id', registration.id);
    if (error) logger.warn('player_workflow email flag update failed:', error.message);
  }

  return result;
}

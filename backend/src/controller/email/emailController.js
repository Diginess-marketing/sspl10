import * as emailTemplateModel from '../../model/emailTemplateModel.js';
import { PLACEHOLDERS, SAMPLE_VALUES, renderTemplate, wrapInLayout } from '../../service/emailTemplateService.js';
import { generateCertificatePdf } from '../../service/certificateService.js';
import ApiError from '../../utils/ApiError.js';
import logger from '../../utils/logger.js';

const BACKGROUND_THRESHOLD = 10;
import * as emailService from '../../service/emailService.js';
import * as paymentLedgerModel from '../../model/paymentLedgerModel.js';
import * as registrationModel from '../../model/registrationModel.js';
import * as emailLogModel from '../../model/emailLogModel.js';
import * as validation from './emailValidation.js';

/**
 * Resolve an audience filter into a de-duplicated recipient list.
 * @param {string} filter One of emailValidation.VALID_FILTERS.
 * @returns {Promise<string[]>}
 */
async function resolveRecipients(filter) {
  switch (filter) {
    case 'paid_users':
      return paymentLedgerModel.listEmailsByStatus('captured');
    case 'failed_payments':
      return paymentLedgerModel.listEmailsByStatus('failed');
    case 'all_registrations':
      return registrationModel.listEmails();
    default:
      return [];
  }
}

/** POST /api/admin/email/bulk */
export const sendBulk = async (req, res) => {
  const { subject, body, filter, testEmail, recipients, attachments } =
    validation.validateBulkEmail(req.body);
  // Composer sends opt into the branded layout; older callers send raw HTML
  const html = req.body.useLayout ? wrapInLayout(body) : body;

  // A test address short-circuits everything else.
  if (testEmail) {
    res.json(await emailService.sendBulkEmail([testEmail], subject, html, attachments));
    return;
  }

  const audience = recipients?.length ? recipients : await resolveRecipients(filter);

  if (audience.length === 0) {
    res.json({ success: 0, failed: 0, message: 'No recipients found for this filter' });
    return;
  }

  // Sends are paced (one every ~2s), so large audiences would outlast the HTTP request:
  // reply straight away and let the send continue; each result is written to email_logs.
  if (audience.length > BACKGROUND_THRESHOLD) {
    emailService
      .sendBulkEmail(audience, subject, html, attachments)
      .then((r) => logger.info(`Bulk email finished: ${r.success} sent, ${r.failed} failed`))
      .catch((err) => logger.error('Bulk email failed:', err));
    res.status(202).json({ queued: audience.length, message: `Sending to ${audience.length} recipients in the background` });
    return;
  }

  res.json(await emailService.sendBulkEmail(audience, subject, html, attachments));
};

/** GET /api/admin/email/logs */
export const listLogs = async (req, res) => {
  const { page, limit, type } = validation.parseLogQuery(req.query);
  const { data, count } = await emailLogModel.paginate({ page, limit, type });

  res.json({
    data,
    total: count,
    page,
    totalPages: Math.ceil(count / limit),
  });
};

// ---- Templates (WYSIWYG composer) ----

/** GET /api/admin/email/templates */
export const listTemplates = async (req, res) => {
  res.json({ templates: await emailTemplateModel.list(), placeholders: PLACEHOLDERS });
};

/** PUT /api/admin/email/templates/:key */
export const saveTemplate = async (req, res) => {
  const template = validation.validateTemplate(req.params.key, req.body);
  res.json(await emailTemplateModel.upsert({ ...template, updated_by: req.user.id }));
};

/** POST /api/admin/email/preview — render unsaved composer content with sample values. */
export const previewTemplate = async (req, res) => {
  const content = validation.validateComposerContent(req.body);
  res.json(renderTemplate(content, SAMPLE_VALUES));
};

/** POST /api/admin/email/test — send unsaved composer content to one address (default: the admin). */
export const sendTest = async (req, res) => {
  const content = validation.validateComposerContent(req.body);
  const to = content.to || req.user.email;
  if (!to) throw ApiError.badRequest('No test address given');

  const { subject, html } = renderTemplate(content, SAMPLE_VALUES);
  const attachments = [];
  if (content.attach_certificate) {
    const kind = /not_selected/.test(req.body.key || '') ? 'participation' : 'achievement';
    const pdf = await generateCertificatePdf({ kind, playerName: SAMPLE_VALUES.name, level: Number(SAMPLE_VALUES.level), certificateNo: SAMPLE_VALUES.certificate_no });
    attachments.push({ name: 'SSPL-Sample-Certificate.pdf', contentType: 'application/pdf', contentBytes: pdf.toString('base64') });
  }

  const result = await emailService.sendEmail({ to, subject: `[TEST] ${subject}`, html, attachments });
  if (!result.success) throw ApiError.badRequest(`Test email failed: ${result.error}`);
  res.json({ sent: true, to });
};

import ApiError from '../../utils/ApiError.js';

const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 500;

export const VALID_FILTERS = ['paid_users', 'all_registrations', 'failed_payments'];

const isEmail = (value) => typeof value === 'string' && value.includes('@');

/**
 * Validate a bulk campaign request.
 *
 * @returns {{subject:string, body:string, filter:string|undefined,
 *            testEmail:string|undefined, recipients:string[]|null,
 *            attachments:Array}}
 */
export function validateBulkEmail(body = {}) {
  const { subject, body: htmlBody, filter, testEmail, recipients, attachments } = body;

  if (!subject || !htmlBody) {
    throw ApiError.badRequest('Subject and Body are required');
  }

  if (testEmail && !isEmail(testEmail)) {
    throw ApiError.badRequest('testEmail is not a valid email address');
  }

  const explicitRecipients = Array.isArray(recipients)
    ? [...new Set(recipients.filter(isEmail))]
    : null;

  // A request must say who it is for: an explicit list, a known filter, or a
  // test address.
  if (!testEmail && !explicitRecipients?.length && !VALID_FILTERS.includes(filter)) {
    throw ApiError.badRequest('Invalid filter or no recipients provided');
  }

  return {
    subject,
    body: htmlBody,
    filter,
    testEmail,
    recipients: explicitRecipients,
    attachments: Array.isArray(attachments) ? attachments : [],
  };
}

/**
 * Normalise the email log query string.
 * @returns {{page:number, limit:number, type:string|undefined}}
 */
export function parseLogQuery(query = {}) {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(
    Math.max(parseInt(query.limit, 10) || DEFAULT_PAGE_SIZE, 1),
    MAX_PAGE_SIZE
  );
  return { page, limit, type: query.type };
}

const TEMPLATE_KEY = /^[a-z0-9_]{3,64}$/;
const MAX_HTML_LENGTH = 200_000;

/** Validate a template save. */
export function validateTemplate(key, body = {}) {
  if (!TEMPLATE_KEY.test(key || '')) throw ApiError.badRequest('Template key must be 3-64 lowercase letters, digits or _');
  const { name, subject, body_html: bodyHtml, enabled, attach_certificate: attachCertificate } = body;
  if (!subject?.trim()) throw ApiError.badRequest('Subject is required');
  if (!bodyHtml?.trim()) throw ApiError.badRequest('Email body is required');
  if (bodyHtml.length > MAX_HTML_LENGTH) throw ApiError.badRequest('Email body is too large');
  return {
    key,
    name: (name || key).trim(),
    subject: subject.trim(),
    body_html: bodyHtml,
    enabled: enabled !== false,
    attach_certificate: Boolean(attachCertificate),
  };
}

/** Validate a preview / test-send request (unsaved composer content). */
export function validateComposerContent(body = {}) {
  const { subject, body_html: bodyHtml, to } = body;
  if (!subject?.trim() || !bodyHtml?.trim()) throw ApiError.badRequest('Subject and body are required');
  if (bodyHtml.length > MAX_HTML_LENGTH) throw ApiError.badRequest('Email body is too large');
  if (to !== undefined && !isEmail(to)) throw ApiError.badRequest('Test address is not a valid email');
  return { subject, body_html: bodyHtml, to, attach_certificate: Boolean(body.attach_certificate) };
}

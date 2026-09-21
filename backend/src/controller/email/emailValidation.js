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

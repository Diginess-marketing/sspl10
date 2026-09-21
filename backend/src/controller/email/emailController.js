const emailService = require('../../service/emailService');
const paymentLedgerModel = require('../../model/paymentLedgerModel');
const registrationModel = require('../../model/registrationModel');
const emailLogModel = require('../../model/emailLogModel');
const validation = require('./emailValidation');

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
exports.sendBulk = async (req, res) => {
  const { subject, body, filter, testEmail, recipients, attachments } =
    validation.validateBulkEmail(req.body);

  // A test address short-circuits everything else.
  if (testEmail) {
    res.json(await emailService.sendBulkEmail([testEmail], subject, body, attachments));
    return;
  }

  const audience = recipients?.length ? recipients : await resolveRecipients(filter);

  if (audience.length === 0) {
    res.json({ success: 0, failed: 0, message: 'No recipients found for this filter' });
    return;
  }

  res.json(await emailService.sendBulkEmail(audience, subject, body, attachments));
};

/** GET /api/admin/email/logs */
exports.listLogs = async (req, res) => {
  const { page, limit, type } = validation.parseLogQuery(req.query);
  const { data, count } = await emailLogModel.paginate({ page, limit, type });

  res.json({
    data,
    total: count,
    page,
    totalPages: Math.ceil(count / limit),
  });
};

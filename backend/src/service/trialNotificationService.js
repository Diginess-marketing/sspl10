import * as trialProgressModel from '../model/trialProgressModel.js';
import * as emailTemplateModel from '../model/emailTemplateModel.js';
import * as emailLogModel from '../model/emailLogModel.js';
import * as emailService from './emailService.js';
import { generateCertificatePdf, newCertificateNo } from './certificateService.js';
import { logoAttachment, renderTemplate, trialPlaceholderValues, trialTemplateKey } from './emailTemplateService.js';
import logger from '../utils/logger.js';

const CERTIFICATE_KIND = { selected: 'achievement', not_selected: 'participation' };

/**
 * Email a player about a level outcome, with the certificate PDF attached when the
 * template asks for one. Each (candidate, level, outcome) is emailed once; `force`
 * re-sends (used by the admin "Resend" button).
 * @returns {Promise<{status:'sent'|'failed'|'skipped', reason?:string, certificateNo?:string}>}
 */
export async function notifyLevelOutcome({ candidateId, level, outcome, force = false }) {
  const record = (entry) =>
    trialProgressModel.recordLevelEmail({ candidate_id: candidateId, level, outcome, ...entry });

  try {
    if (!force) {
      const previous = await trialProgressModel.findLevelEmail(candidateId, level, outcome);
      if (previous?.status === 'sent') return { status: 'skipped', reason: 'Already emailed' };
    }

    const template = await emailTemplateModel.findByKey(trialTemplateKey(level, outcome));
    if (!template || !template.enabled) {
      const reason = template ? 'Template is switched off' : 'No template for this level/outcome';
      await record({ status: 'skipped', error: reason });
      return { status: 'skipped', reason };
    }

    const found = await trialProgressModel.findCandidate(candidateId);
    if (!found) return { status: 'skipped', reason: 'Candidate not found' };
    const { contact } = found;
    if (!contact.email) {
      await record({ status: 'skipped', error: 'No email address on file' });
      return { status: 'skipped', reason: 'No email address on file' };
    }

    let certificateNo;
    const attachments = [logoAttachment()];
    const kind = CERTIFICATE_KIND[outcome];
    if (template.attach_certificate && kind) {
      const certificate = await trialProgressModel.findOrCreateCertificate({
        candidateId,
        level,
        kind,
        playerName: contact.name,
        newNumber: () => newCertificateNo(level, kind),
      });
      certificateNo = certificate.certificate_no;
      const pdf = await generateCertificatePdf({
        kind,
        playerName: certificate.player_name,
        level,
        certificateNo,
        issuedAt: new Date(certificate.issued_at),
      });
      attachments.push({
        name: `SSPL-Level-${level}-${kind === 'achievement' ? 'Achievement' : 'Participation'}-Certificate.pdf`,
        contentType: 'application/pdf',
        contentBytes: pdf.toString('base64'),
      });
    }

    const { subject, html } = renderTemplate(template, trialPlaceholderValues({ ...contact, level, certificateNo }));
    const result = await emailService.sendEmail({ to: contact.email, subject, html, attachments });

    await record({
      recipient: contact.email,
      status: result.success ? 'sent' : 'failed',
      error: result.success ? null : result.error,
      certificate_no: certificateNo || null,
    });
    await emailLogModel
      .insert({ recipientEmail: contact.email, recipientName: contact.name, type: trialTemplateKey(level, outcome), success: result.success, error: result.error })
      .catch((err) => logger.warn('email_logs insert failed:', err.message));

    return result.success
      ? { status: 'sent', certificateNo }
      : { status: 'failed', reason: result.error, certificateNo };
  } catch (err) {
    logger.error(`Level ${level} ${outcome} email for ${candidateId} failed:`, err);
    await record({ status: 'failed', error: err.message }).catch(() => {});
    return { status: 'failed', reason: err.message };
  }
}

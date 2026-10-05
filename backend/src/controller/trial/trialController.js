import * as trialProgressModel from '../../model/trialProgressModel.js';
import { applyLevelChange, TrialRuleError } from '../../service/trialLevelRules.js';
import { notifyLevelOutcome } from '../../service/trialNotificationService.js';
import { generateCertificatePdf, newCertificateNo } from '../../service/certificateService.js';
import ApiError from '../../utils/ApiError.js';

const parseLevel = (value) => {
  const level = Number(value);
  if (!Number.isInteger(level) || level < 1 || level > 5) throw ApiError.badRequest('Level must be 1-5');
  return level;
};

const OUTCOME_FOR_RESULT = { SELECTED: 'selected', REJECTED: 'not_selected' };

/** The outcome a candidate currently has at a level (what a resend would email). */
function currentOutcome(progress, level) {
  if (!progress) return null;
  const result = String(progress[`l${level}_result`] || '').toUpperCase();
  if (OUTCOME_FOR_RESULT[result]) return OUTCOME_FOR_RESULT[result];
  if (String(progress[`l${level}_attendance`] || '').toUpperCase() === 'ABSENT') return 'absent';
  return null;
}

async function loadCandidate(id) {
  const found = await trialProgressModel.findCandidate(id);
  if (!found) throw ApiError.notFound('Candidate not found');
  return found;
}

/**
 * PATCH /api/admin/trials/candidates/:id/levels/:level
 * body: { called?, attendance?, result?, marks?, remarks? }
 * Saves the change under the level rules, then emails the player when the
 * change produces an outcome (selected / not selected / absent).
 */
export const updateLevel = async (req, res) => {
  const level = parseLevel(req.params.level);
  const { progress } = await loadCandidate(req.params.id);

  let change;
  try {
    change = applyLevelChange(progress || {}, level, req.body || {});
  } catch (err) {
    if (err instanceof TrialRuleError) throw ApiError.badRequest(err.message);
    throw err;
  }

  const saved = await trialProgressModel.saveProgress(req.params.id, change.update);
  const notification = change.outcome
    ? await notifyLevelOutcome({ candidateId: req.params.id, level, outcome: change.outcome })
    : null;

  res.json({ progress: saved, outcome: change.outcome, notification });
};

/** POST /api/admin/trials/candidates/:id/levels/:level/notify — resend the current outcome email. */
export const resendLevelEmail = async (req, res) => {
  const level = parseLevel(req.params.level);
  const { progress } = await loadCandidate(req.params.id);
  const outcome = currentOutcome(progress, level);
  if (!outcome) throw ApiError.badRequest(`No result or absence at level ${level} to email about`);
  res.json(await notifyLevelOutcome({ candidateId: req.params.id, level, outcome, force: true }));
};

/** GET /api/admin/trials/candidates/:id/levels/:level/certificate — the PDF, for admins. */
export const downloadCertificate = async (req, res) => {
  const level = parseLevel(req.params.level);
  const { progress, contact } = await loadCandidate(req.params.id);
  const outcome = currentOutcome(progress, level);
  const kind = outcome === 'selected' ? 'achievement' : outcome === 'not_selected' ? 'participation' : null;
  if (!kind) throw ApiError.badRequest(`Level ${level} has no result yet, so there is no certificate`);

  const certificate = await trialProgressModel.findOrCreateCertificate({
    candidateId: req.params.id,
    level,
    kind,
    playerName: contact.name,
    newNumber: () => newCertificateNo(level, kind),
  });
  const pdf = await generateCertificatePdf({
    kind,
    playerName: certificate.player_name,
    level,
    certificateNo: certificate.certificate_no,
    issuedAt: new Date(certificate.issued_at),
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${certificate.certificate_no}.pdf"`);
  res.send(pdf);
};

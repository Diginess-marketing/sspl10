import supabase from '../../config/supabase.js';
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

const PAID = ['captured', 'paid', 'completed', 'success'];
const last10 = (v) => String(v ?? '').replace(/\D/g, '').slice(-10);

async function fetchAll(table, select) {
  const rows = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase.from(table).select(select).order('id').range(from, from + 999);
    if (error) throw error;
    rows.push(...data);
    if (data.length < 1000) return rows;
  }
}

/**
 * POST /api/admin/trials/sync-candidates
 * Adds every paid registration that is not on the L1-L5 tracker yet (matched by registration
 * id or by mobile, so imported players are not duplicated). Replaces the sync_trial_candidates
 * database function, which the live database does not have. Returns { added }.
 */
export const syncCandidates = async (req, res) => {
  const [registrations, candidates, progress] = await Promise.all([
    fetchAll('player_registrations', 'id,full_name,phone,email,state,position,payment_status,razorpay_payment_id'),
    fetchAll('trial_candidates', 'id,registration_id,mobile'),
    fetchAll('trial_progress', 'id,candidate_id'),
  ]);
  const byReg = new Set(candidates.map((c) => c.registration_id).filter(Boolean));
  const byMobile = new Set(candidates.map((c) => last10(c.mobile)).filter((m) => m.length === 10));
  const seenMobile = new Set();
  const now = new Date().toISOString();

  const toAdd = [];
  for (const r of registrations) {
    if (!PAID.includes(String(r.payment_status || '').toLowerCase())) continue;
    const mobile = last10(r.phone);
    if (byReg.has(r.id) || (mobile.length === 10 && (byMobile.has(mobile) || seenMobile.has(mobile)))) continue;
    if (mobile.length === 10) seenMobile.add(mobile);
    toAdd.push({
      id: r.id,
      registration_id: r.id,
      name: r.full_name,
      mobile: r.phone,
      email: r.email,
      state: r.state,
      proficiency: r.position,
      payment_status: r.payment_status,
      payment_id: r.razorpay_payment_id,
      status: 'ACTIVE',
      imported_at: now,
    });
  }
  for (let i = 0; i < toAdd.length; i += 500) {
    const { error } = await supabase.from('trial_candidates').insert(toAdd.slice(i, i + 500));
    if (error) throw error;
  }

  // Every candidate needs a progress row for the level screens
  const withProgress = new Set(progress.map((p) => p.candidate_id));
  const missing = [...candidates.map((c) => c.id), ...toAdd.map((c) => c.id)].filter((id) => !withProgress.has(id));
  for (let i = 0; i < missing.length; i += 500) {
    const { error } = await supabase.from('trial_progress')
      .insert(missing.slice(i, i + 500).map((candidate_id) => ({ candidate_id, current_level: 1, final_status: 'IN_PROGRESS' })));
    if (error) throw error;
  }
  res.json({ added: toAdd.length });
};

const VERIFY_WINDOW_MS = 60 * 60 * 1000;
const VERIFY_MAX = 60;
const verifyHits = new Map(); // ip -> timestamps

/**
 * GET /api/certificates/:number — public check that a certificate is genuine (PRD feature 9).
 * Shows the player's name, level, type and date. Looks in trial_certificates first; numbers
 * issued before that table existed are derived from the candidate, so they are found by
 * recomputing them for every candidate with a result at that level.
 */
export const verifyCertificate = async (req, res) => {
  const now = Date.now();
  const hits = (verifyHits.get(req.ip) || []).filter((t) => now - t < VERIFY_WINDOW_MS);
  hits.push(now);
  verifyHits.set(req.ip, hits);
  if (hits.length > VERIFY_MAX) throw ApiError.badRequest('Too many checks. Please try again later.');

  const number = String(req.params.number || '').trim().toUpperCase();
  const match = /^SSPL-L([1-5])-([AP])-([A-Z0-9]{6})$/.exec(number);
  if (!match) throw ApiError.badRequest('Certificate numbers look like SSPL-L1-A-ABC123');
  const level = Number(match[1]);
  const kind = match[2] === 'A' ? 'achievement' : 'participation';

  let found = null;
  const { data: stored, error } = await supabase.from('trial_certificates')
    .select('candidate_id, level, kind, player_name, issued_at').eq('certificate_no', number).maybeSingle();
  if (error && error.code !== 'PGRST205') throw error;
  if (stored) found = { candidateId: stored.candidate_id, name: stored.player_name, issuedAt: stored.issued_at };

  if (!found) {
    const wanted = kind === 'achievement' ? 'SELECTED' : 'REJECTED';
    const rows = [];
    for (let from = 0; ; from += 1000) {
      const { data, error: pErr } = await supabase.from('trial_progress').select('*').order('id').range(from, from + 999);
      if (pErr) throw pErr;
      rows.push(...data);
      if (data.length < 1000) break;
    }
    const hit = rows.find((p) => {
      const result = String(p[`l${level}_result`] ?? p.metadata?.[`l${level}_result`] ?? '').toUpperCase();
      return result === wanted && trialProgressModel.certificateNoFor(p.candidate_id, level, kind) === number;
    });
    if (hit) found = { candidateId: hit.candidate_id, name: null, issuedAt: hit.updated_at };
  }

  if (!found) return res.json({ valid: false, number });
  if (!found.name) {
    const candidate = await trialProgressModel.findCandidate(found.candidateId);
    found.name = candidate?.contact?.name || null;
  }
  res.json({
    valid: true,
    number,
    name: found.name,
    level,
    kind,
    title: kind === 'achievement' ? `Level ${level} Certificate of Achievement` : `Level ${level} Certificate of Participation`,
    issuedAt: found.issuedAt,
  });
};

import supabase from '../../config/supabase.js';
import ApiError from '../../utils/ApiError.js';
import * as trialProgressModel from '../../model/trialProgressModel.js';
import { generateCertificatePdf, newCertificateNo } from '../../service/certificateService.js';
import { generateInvoicePdf } from '../../service/invoiceService.js';

// The signed-in player's own dashboard (PRD feature 10). A player is identified by the email
// they signed in with (verified by Supabase Auth), never by a number typed into a form, so
// nobody can look up someone else's registration.

const PAID = ['captured', 'paid', 'completed', 'success'];
const last10 = (v) => String(v ?? '').replace(/\D/g, '').slice(-10);
const up = (v) => String(v ?? '').trim().toUpperCase();

async function ownRegistrations(user) {
  const email = String(user?.email || '').trim();
  if (!email) throw ApiError.badRequest('Your account has no email address');
  const { data, error } = await supabase.from('player_registrations')
    .select('id,full_name,email,phone,city,state,position,created_at,payment_status,payment_amount,amount_paid,razorpay_payment_id,team,team_id,is_captain')
    .ilike('email', email.replace(/[%_]/g, '\\$&'))
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

async function ownRegistration(user, registrationId) {
  const reg = (await ownRegistrations(user)).find((r) => r.id === registrationId);
  if (!reg) throw ApiError.notFound('Registration not found on your account');
  return reg;
}

/** The trial candidate for a paid registration: by registration id, else by mobile. */
async function candidateFor(reg) {
  if (!PAID.includes(String(reg.payment_status || '').toLowerCase())) return null;
  const id = await trialProgressModel.findCandidateIdForRegistration(reg.id, reg.phone);
  if (!id) return null;
  return trialProgressModel.findCandidate(id);
}

function levelsOf(progress) {
  return [1, 2, 3, 4, 5].map((level) => {
    const get = (f) => progress?.[`l${level}_${f}`] ?? progress?.metadata?.[`l${level}_${f}`] ?? null;
    const result = up(get('result'));
    const attendance = up(get('attendance'));
    return {
      level,
      called: Boolean(get('called')),
      attendance: attendance || null,
      result: result === 'SELECTED' ? 'selected' : result === 'REJECTED' ? 'not_selected' : null,
      certificate: result === 'SELECTED' ? 'achievement' : result === 'REJECTED' ? 'participation' : null,
    };
  });
}

/** One sentence on what happens next, in the player's terms. */
function nextStep({ paid, workflowStage, slot, finalStatus, currentLevel }) {
  if (!paid) return 'Complete your payment to confirm your registration.';
  if (finalStatus === 'SELECTED') return 'Congratulations, you cleared all five levels. The SSPL team will contact you about the next steps.';
  if (finalStatus === 'REJECTED') return `Your trial journey ended at Level ${currentLevel}. Your certificate is below. Thank you for taking part.`;
  if (finalStatus === 'ABSENT') return `You were marked absent at Level ${currentLevel}. Contact SSPL if you want to ask about rebooking.`;
  const upcoming = slot?.allocation_date && String(slot.allocation_date).slice(0, 10) >= new Date().toISOString().slice(0, 10);
  if (upcoming) return `Attend your Level ${currentLevel || 1} trial on the date below. Arrive 30 minutes early in sports kit with a photo ID.`;
  if (currentLevel > 1) return `You are through to Level ${currentLevel}. We will email and message you the date and venue.`;
  if (workflowStage && workflowStage !== 'registration' && workflowStage !== 'registration_completed') return 'You are in the trials list. We will email and message you your trial date and venue.';
  return 'Your payment is confirmed. We will email and message you when your trial date is fixed.';
}

/** GET /api/player/me */
export const me = async (req, res) => {
  const regs = await ownRegistrations(req.user);
  const { data: profile } = await supabase.from('user_profiles').select('reward_points,referral_code').eq('id', req.user.id).maybeSingle();

  const registrations = [];
  for (const reg of regs) {
    const paid = PAID.includes(String(reg.payment_status || '').toLowerCase());
    const { data: wf } = await supabase.from('player_workflow').select('workflow_id,workflow_stage').eq('registration_id', reg.id).maybeSingle();
    const { data: slot } = wf
      ? await supabase.from('trials_allocations').select('allocation_date,allocation_time,allocation_venue,allocation_batch,attendance_status').eq('workflow_id', wf.workflow_id).maybeSingle()
      : { data: null };
    const found = await candidateFor(reg);
    const progress = found?.progress || null;
    const finalStatus = up(progress?.final_status) || null;
    const currentLevel = progress?.current_level || (found ? 1 : null);
    registrations.push({
      id: reg.id,
      name: reg.full_name,
      registeredAt: reg.created_at,
      team: reg.team || null,
      paymentStatus: String(reg.payment_status || 'pending').toLowerCase(),
      paid,
      amount: Number(reg.amount_paid ?? reg.payment_amount ?? 0) || null,
      paymentId: reg.razorpay_payment_id || null,
      receipt: paid && Boolean(reg.razorpay_payment_id),
      slot: slot ? { date: slot.allocation_date, time: slot.allocation_time, venue: slot.allocation_venue, batch: slot.allocation_batch } : null,
      onTracker: Boolean(found),
      currentLevel,
      finalStatus,
      levels: found ? levelsOf(progress) : [],
      nextStep: nextStep({ paid, workflowStage: wf?.workflow_stage, slot, finalStatus, currentLevel }),
    });
  }

  res.json({
    email: req.user.email,
    rewardPoints: profile?.reward_points ?? 0,
    referralCode: profile?.referral_code ?? null,
    registrations,
  });
};

/** GET /api/player/me/receipt/:registrationId — the receipt / GST invoice for the player's own payment. */
export const receipt = async (req, res) => {
  const reg = await ownRegistration(req.user, req.params.registrationId);
  if (!PAID.includes(String(reg.payment_status || '').toLowerCase()) || !reg.razorpay_payment_id) {
    throw ApiError.badRequest('There is no completed payment on this registration');
  }
  const { data: ledger } = await supabase.from('razorpay_ledger').select('amount,created_at,captured_at').eq('payment_id', reg.razorpay_payment_id).maybeSingle();
  const { pdf, number } = await generateInvoicePdf({
    paymentId: reg.razorpay_payment_id,
    paidAt: ledger?.captured_at || ledger?.created_at || reg.created_at,
    amount: Number(ledger?.amount ?? reg.amount_paid ?? reg.payment_amount ?? 0),
    buyer: { name: reg.full_name, email: reg.email, phone: reg.phone, state: reg.state, city: reg.city },
  });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${number.replace(/\//g, '-')}.pdf"`);
  res.send(pdf);
};

/** GET /api/player/me/certificate/:registrationId/:level — the player's own certificate. */
export const certificate = async (req, res) => {
  const level = Number(req.params.level);
  if (!Number.isInteger(level) || level < 1 || level > 5) throw ApiError.badRequest('Level must be 1-5');
  const reg = await ownRegistration(req.user, req.params.registrationId);
  const found = await candidateFor(reg);
  const lv = found ? levelsOf(found.progress).find((l) => l.level === level) : null;
  if (!lv?.certificate) throw ApiError.badRequest(`There is no Level ${level} result yet, so there is no certificate`);

  const cert = await trialProgressModel.findOrCreateCertificate({
    candidateId: found.candidate.id,
    level,
    kind: lv.certificate,
    playerName: found.contact.name || reg.full_name,
    newNumber: () => newCertificateNo(level, lv.certificate),
  });
  const pdf = await generateCertificatePdf({
    kind: lv.certificate,
    playerName: cert.player_name,
    level,
    certificateNo: cert.certificate_no,
    issuedAt: new Date(cert.issued_at),
  });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${cert.certificate_no}.pdf"`);
  res.send(pdf);
};

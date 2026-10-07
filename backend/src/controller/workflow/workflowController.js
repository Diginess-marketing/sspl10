import supabase from '../../config/supabase.js';
import ApiError from '../../utils/ApiError.js';
import logger from '../../utils/logger.js';
import { sendRegistrationConfirmation } from '../../service/registrationEmailService.js';

const PAID = ['captured', 'paid', 'completed', 'success'];
const MAX_BATCH = 500;
// Starting stages: older rows use 'registration_completed', newer ones 'registration'
const START_STAGES = ['registration', 'registration_completed'];
const isUuid = (v) => typeof v === 'string' && /^[0-9a-f-]{36}$/i.test(v);

async function findRegistrations(ids) {
  const rows = [];
  for (let i = 0; i < ids.length; i += 150) {
    const { data, error } = await supabase.from('player_registrations').select('*').in('id', ids.slice(i, i + 150));
    if (error) throw error;
    rows.push(...(data || []));
  }
  return new Map(rows.map((r) => [r.id, r]));
}

async function findWorkflows(registrationIds) {
  const rows = [];
  for (let i = 0; i < registrationIds.length; i += 150) {
    const { data, error } = await supabase.from('player_workflow').select('*').in('registration_id', registrationIds.slice(i, i + 150));
    if (error) throw error;
    rows.push(...(data || []));
  }
  return new Map(rows.map((w) => [w.registration_id, w]));
}

/** Audit trail; never blocks the move. */
async function recordHistory(entry) {
  const { error } = await supabase.from('workflow_history').insert({ ...entry, performed_at: new Date().toISOString() });
  if (error) logger.warn('workflow_history insert failed:', error.message);
}

/**
 * POST /api/admin/workflow/move-to-trials  body: { registrationIds: string[] }
 * Paid registrations move to the Trials Section (a workflow row is created when missing).
 * Same rules and response as the move_to_trials_section database function, which fails on the
 * live database (it writes player_workflow.manually_moved, a column the table does not have).
 */
export const moveToTrials = async (req, res) => {
  const ids = [...new Set((req.body?.registrationIds || []).filter(isUuid))];
  if (!ids.length) throw ApiError.badRequest('registrationIds is required');
  if (ids.length > MAX_BATCH) throw ApiError.badRequest(`At most ${MAX_BATCH} players per move`);

  const [registrations, workflows] = await Promise.all([findRegistrations(ids), findWorkflows(ids)]);
  const now = new Date().toISOString();
  const results = [];

  for (const id of ids) {
    const reg = registrations.get(id);
    if (!reg) { results.push({ registration_id: id, success: false, message: 'Registration not found' }); continue; }
    if (!PAID.includes(String(reg.payment_status || '').toLowerCase())) {
      results.push({ registration_id: id, success: false, message: 'Payment not completed' });
      continue;
    }

    const existing = workflows.get(id);
    if (existing && existing.workflow_stage && !START_STAGES.includes(existing.workflow_stage)) {
      results.push({ registration_id: id, success: true, message: `Already in ${existing.workflow_stage.replace(/_/g, ' ')}` });
      continue;
    }

    const stageFields = { workflow_stage: 'trials_section', moved_to_trials_at: now, updated_at: now };
    const { data, error } = existing
      ? await supabase.from('player_workflow').update(stageFields).eq('workflow_id', existing.workflow_id).select('workflow_id').single()
      : await supabase.from('player_workflow').insert({
        registration_id: id,
        full_name: reg.full_name,
        email: reg.email,
        phone: reg.phone,
        city: reg.city,
        state: reg.state,
        pincode: reg.pincode,
        payment_status: reg.payment_status,
        payment_amount: reg.payment_amount,
        ...stageFields,
      }).select('workflow_id').single();

    if (error) {
      results.push({ registration_id: id, success: false, message: error.message });
      continue;
    }
    await recordHistory({
      workflow_id: data.workflow_id,
      previous_stage: existing?.workflow_stage || 'registration',
      new_stage: 'trials_section',
      action_type: 'moved_to_trials',
      action_details: { manual: true },
      performed_by: req.user.id,
    });
    results.push({ registration_id: id, success: true, message: 'Moved to trials section' });
  }

  res.json(results);
};

/**
 * POST /api/admin/workflow/confirmation-email  body: { registrationId }
 * (Re)sends the registration confirmation. Player details come from the database.
 */
export const sendConfirmation = async (req, res) => {
  const id = req.body?.registrationId;
  if (!isUuid(id)) throw ApiError.badRequest('registrationId is required');
  const registration = (await findRegistrations([id])).get(id);
  if (!registration) throw ApiError.notFound('Registration not found');
  if (!PAID.includes(String(registration.payment_status || '').toLowerCase())) {
    throw ApiError.badRequest('Payment not completed, so there is nothing to confirm');
  }

  const result = await sendRegistrationConfirmation(registration, {
    amount: registration.amount_paid || registration.payment_amount,
    paymentId: registration.razorpay_payment_id,
  });
  if (!result.success) throw ApiError.badRequest(`Email not sent: ${result.error}`);
  res.json({ sent: true, to: registration.email });
};

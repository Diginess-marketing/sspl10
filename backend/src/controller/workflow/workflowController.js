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

/**
 * POST /api/admin/workflow/slot  body: { registrationId, trialId }
 * Puts a paid player into a trial event (Admin -> Players -> Change slot): copies the event's
 * date, time, venue and batch onto the player's allocation (created when missing) and marks
 * the workflow as allocated.
 */
export const assignSlot = async (req, res) => {
  const { registrationId, trialId } = req.body || {};
  if (!isUuid(registrationId) || !isUuid(trialId)) throw ApiError.badRequest('registrationId and trialId are required');

  const registration = (await findRegistrations([registrationId])).get(registrationId);
  if (!registration) throw ApiError.notFound('Registration not found');
  if (!PAID.includes(String(registration.payment_status || '').toLowerCase())) {
    throw ApiError.badRequest('Payment not completed, so the player cannot be given a trial slot');
  }

  const { data: trial, error: tErr } = await supabase.from('trials').select('*').eq('trial_id', trialId).maybeSingle();
  if (tErr) throw tErr;
  if (!trial) throw ApiError.notFound('Trial not found');

  const now = new Date().toISOString();
  let workflow = (await findWorkflows([registrationId])).get(registrationId);
  if (!workflow) {
    const { data, error } = await supabase.from('player_workflow').insert({
      registration_id: registrationId,
      full_name: registration.full_name,
      email: registration.email,
      phone: registration.phone,
      city: registration.city,
      state: registration.state,
      pincode: registration.pincode,
      payment_status: registration.payment_status,
      payment_amount: registration.payment_amount,
      workflow_stage: 'trials_section',
      moved_to_trials_at: now,
      updated_at: now,
    }).select('*').single();
    if (error) throw error;
    workflow = data;
  }

  const slot = {
    allocation_date: trial.trial_date,
    allocation_time: trial.trial_time,
    allocation_venue: [trial.trial_venue, trial.trial_address].filter(Boolean).join(', ') || trial.trial_name,
    allocation_batch: trial.trial_batch,
  };
  const { data: existing, error: aErr } = await supabase
    .from('trials_allocations').select('allocation_id').eq('workflow_id', workflow.workflow_id).maybeSingle();
  if (aErr) throw aErr;
  const { data: allocation, error: wErr } = existing
    ? await supabase.from('trials_allocations').update(slot).eq('allocation_id', existing.allocation_id).select('*').single()
    : await supabase.from('trials_allocations').insert({ workflow_id: workflow.workflow_id, attendance_status: 'pending', ...slot }).select('*').single();
  if (wErr) throw wErr;

  const previousStage = workflow.workflow_stage;
  if (previousStage !== 'trials_allocated') {
    const { error } = await supabase.from('player_workflow')
      .update({ workflow_stage: 'trials_allocated', allocated_to_trials_at: now, updated_at: now })
      .eq('workflow_id', workflow.workflow_id);
    if (error) throw error;
  }
  await recordHistory({
    workflow_id: workflow.workflow_id,
    previous_stage: previousStage,
    new_stage: 'trials_allocated',
    action_type: existing ? 'slot_changed' : 'allocated_to_trial',
    action_details: { trial_id: trialId, trial_name: trial.trial_name, ...slot },
    performed_by: req.user.id,
  });

  res.json({ allocation });
};

/**
 * POST /api/admin/workflow/allocate
 * body: { workflowIds: string[], allocationDate, allocationTime?, allocationVenue?, allocationBatch? }
 * Gives players in the Trials Section a trial slot. Replaces the allocate_to_trials database
 * function, which fails on the live database ("column id does not exist").
 */
export const allocateToTrials = async (req, res) => {
  const { allocationDate, allocationTime, allocationVenue, allocationBatch } = req.body || {};
  const ids = [...new Set((req.body?.workflowIds || []).filter(isUuid))];
  if (!ids.length) throw ApiError.badRequest('workflowIds is required');
  if (ids.length > MAX_BATCH) throw ApiError.badRequest(`At most ${MAX_BATCH} players per allocation`);
  if (!allocationDate) throw ApiError.badRequest('allocationDate is required');

  const { data: workflows, error: wfErr } = await supabase
    .from('player_workflow').select('workflow_id,workflow_stage').in('workflow_id', ids);
  if (wfErr) throw wfErr;
  const byId = new Map((workflows || []).map((w) => [w.workflow_id, w]));
  const { data: existingRows, error: exErr } = await supabase
    .from('trials_allocations').select('allocation_id,workflow_id').in('workflow_id', ids);
  if (exErr) throw exErr;
  const existingByWf = new Map((existingRows || []).map((a) => [a.workflow_id, a]));

  const slot = {
    allocation_date: allocationDate,
    allocation_time: allocationTime || null,
    allocation_venue: allocationVenue || null,
    allocation_batch: allocationBatch || null,
  };
  const now = new Date().toISOString();
  const results = [];
  for (const id of ids) {
    const workflow = byId.get(id);
    if (!workflow) { results.push({ workflow_id: id, success: false, message: 'Player not found in the workflow' }); continue; }
    try {
      const existing = existingByWf.get(id);
      const { error: aErr } = existing
        ? await supabase.from('trials_allocations').update(slot).eq('allocation_id', existing.allocation_id)
        : await supabase.from('trials_allocations').insert({ workflow_id: id, attendance_status: 'pending', ...slot });
      if (aErr) throw aErr;
      if (workflow.workflow_stage !== 'trials_allocated') {
        const { error } = await supabase.from('player_workflow')
          .update({ workflow_stage: 'trials_allocated', allocated_to_trials_at: now, updated_at: now })
          .eq('workflow_id', id);
        if (error) throw error;
      }
      await recordHistory({
        workflow_id: id,
        previous_stage: workflow.workflow_stage,
        new_stage: 'trials_allocated',
        action_type: existing ? 'slot_changed' : 'allocated_to_trial',
        action_details: slot,
        performed_by: req.user.id,
      });
      results.push({ workflow_id: id, success: true, message: existing ? 'Slot updated' : 'Allocated' });
    } catch (err) {
      results.push({ workflow_id: id, success: false, message: err.message });
    }
  }
  res.json(results);
};

const ATTENDANCE = ['pending', 'attended', 'absent'];
const SELECTION = ['pending', 'selected', 'not_selected', 'waitlisted'];

async function findAllocation(allocationId) {
  if (!isUuid(allocationId)) throw ApiError.badRequest('allocationId is required');
  const { data, error } = await supabase.from('trials_allocations').select('*').eq('allocation_id', allocationId).maybeSingle();
  if (error) throw error;
  if (!data) throw ApiError.notFound('Allocation not found');
  return data;
}

/**
 * POST /api/admin/workflow/attendance  body: { allocationId, status: pending|attended|absent }
 * Replaces the mark_trial_attendance database function, which fails on the live database.
 */
export const markAttendance = async (req, res) => {
  const { allocationId, status } = req.body || {};
  if (!ATTENDANCE.includes(status)) throw ApiError.badRequest(`status must be one of ${ATTENDANCE.join(', ')}`);
  const allocation = await findAllocation(allocationId);
  const { error } = await supabase.from('trials_allocations')
    .update({ attendance_status: status, attended_at: status === 'pending' ? null : new Date().toISOString() })
    .eq('allocation_id', allocationId);
  if (error) throw error;
  await recordHistory({
    workflow_id: allocation.workflow_id,
    previous_stage: 'trials_allocated',
    new_stage: 'trials_allocated',
    action_type: 'attendance_marked',
    action_details: { from: allocation.attendance_status, to: status },
    performed_by: req.user.id,
  });
  res.json({ success: true });
};

/**
 * POST /api/admin/workflow/results
 * body: { allocationId, battingScore?, bowlingScore?, fieldingScore?, overallScore?, selectionStatus?, remarks?, evaluatorNotes? }
 * Saves scores and the selection decision on the allocation. Replaces the update_trial_results
 * database function, which fails on the live database.
 */
export const saveResults = async (req, res) => {
  const b = req.body || {};
  const selection = b.selectionStatus || 'pending';
  if (!SELECTION.includes(selection)) throw ApiError.badRequest(`selectionStatus must be one of ${SELECTION.join(', ')}`);
  const score = (v) => {
    if (v === undefined || v === null || v === '') return null;
    const n = Number(v);
    if (!Number.isFinite(n) || n < 0 || n > 100) throw ApiError.badRequest('Scores must be numbers from 0 to 100');
    return n;
  };
  const allocation = await findAllocation(b.allocationId);
  const fields = {
    batting_score: score(b.battingScore),
    bowling_score: score(b.bowlingScore),
    fielding_score: score(b.fieldingScore),
    overall_score: score(b.overallScore),
    selection_status: selection,
    remarks: b.remarks || null,
    evaluator_notes: b.evaluatorNotes || null,
    evaluated_at: new Date().toISOString(),
  };
  const { error } = await supabase.from('trials_allocations').update(fields).eq('allocation_id', b.allocationId);
  if (error) throw error;
  await recordHistory({
    workflow_id: allocation.workflow_id,
    previous_stage: 'trials_allocated',
    new_stage: 'trials_allocated',
    action_type: 'trial_result_saved',
    action_details: { selection_status: selection, overall_score: fields.overall_score },
    performed_by: req.user.id,
  });
  res.json({ success: true });
};

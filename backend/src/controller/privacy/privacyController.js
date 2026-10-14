import supabase from '../../config/supabase.js';
import ApiError from '../../utils/ApiError.js';

// A player's right to see or delete their data (PRD section 10). Super admins only.
// Erasing keeps the payment and trial records the league needs for its accounts, but removes
// everything that identifies the person.

const isUuid = (v) => typeof v === 'string' && /^[0-9a-f-]{36}$/i.test(v);
const last10 = (v) => String(v ?? '').replace(/\D/g, '').slice(-10);

async function gather(registrationId) {
  if (!isUuid(registrationId)) throw ApiError.badRequest('Invalid registration id');
  const { data: reg, error } = await supabase.from('player_registrations').select('*').eq('id', registrationId).maybeSingle();
  if (error) throw error;
  if (!reg) throw ApiError.notFound('Registration not found');
  const mobile = last10(reg.phone);
  const [{ data: workflow }, { data: emails }, { data: candidatesById }, { data: candidatesByPhone }] = await Promise.all([
    supabase.from('player_workflow').select('*').eq('registration_id', reg.id),
    supabase.from('email_logs').select('email_type,status,sent_at,recipient_email').eq('registration_id', reg.id),
    supabase.from('trial_candidates').select('*').eq('registration_id', reg.id),
    mobile.length === 10 ? supabase.from('trial_candidates').select('*').ilike('mobile', `%${mobile}`) : Promise.resolve({ data: [] }),
  ]);
  const candidates = [...new Map([...(candidatesById || []), ...(candidatesByPhone || [])].map((c) => [c.id, c])).values()];
  const workflowIds = (workflow || []).map((w) => w.workflow_id);
  const candidateIds = candidates.map((c) => c.id);
  const [{ data: allocations }, { data: progress }] = await Promise.all([
    workflowIds.length ? supabase.from('trials_allocations').select('*').in('workflow_id', workflowIds) : Promise.resolve({ data: [] }),
    candidateIds.length ? supabase.from('trial_progress').select('*').in('candidate_id', candidateIds) : Promise.resolve({ data: [] }),
  ]);
  return { registration: reg, workflow: workflow || [], trialAllocations: allocations || [], trialCandidates: candidates, trialProgress: progress || [], emailsSent: emails || [] };
}

/** GET /api/admin/privacy/registrations/:id/export — everything held about the player, as JSON. */
export const exportData = async (req, res) => {
  const data = await gather(req.params.id);
  res.setHeader('Content-Disposition', `attachment; filename="sspl-player-data-${req.params.id}.json"`);
  res.json({ exportedAt: new Date().toISOString(), exportedBy: req.user?.email, ...data });
};

/**
 * POST /api/admin/privacy/registrations/:id/erase  body: { confirm: 'ERASE', reason }
 * Removes name, contact details, date of birth, school, photo and parent details from the
 * registration and every linked record. Payment amounts, statuses and trial results stay,
 * without anything that identifies the person. Cannot be undone.
 */
export const erase = async (req, res) => {
  if (req.body?.confirm !== 'ERASE') throw ApiError.badRequest('Type ERASE to confirm');
  if (String(req.body?.reason || '').trim().length < 5) throw ApiError.badRequest('Give the reason (e.g. the player\'s request and date)');
  const data = await gather(req.params.id);
  const reg = data.registration;
  const now = new Date().toISOString();
  const label = `Erased player ${reg.id.slice(0, 8)}`;

  const updates = [
    supabase.from('player_registrations').update({
      full_name: label, email: null, phone: null, date_of_birth: null, school_name: null, pincode: null, town: null,
      team_members: null, updated_at: now,
      ...(Object.prototype.hasOwnProperty.call(reg, 'photo_url') && { photo_url: null }),
      ...(Object.prototype.hasOwnProperty.call(reg, 'parent_name') && { parent_name: null, parent_phone: null }),
    }).eq('id', reg.id),
    ...data.workflow.map((w) => supabase.from('player_workflow').update({ full_name: label, email: null, phone: null, pincode: null, updated_at: now }).eq('workflow_id', w.workflow_id)),
    ...data.trialCandidates.map((c) => supabase.from('trial_candidates').update({ name: label, mobile: null, email: null }).eq('id', c.id)),
    supabase.from('email_logs').update({ recipient_email: 'erased@erased.invalid', recipient_name: label }).eq('registration_id', reg.id),
  ];
  const results = await Promise.all(updates);
  const failed = results.find((r) => r.error);
  if (failed) throw failed.error;

  // The action history keeps who erased what and why, but none of the erased details
  await supabase.from('admin_audit_log').insert({
    actor_id: req.user?.id, actor_email: req.user?.email, staff_role: req.staffRole, source: 'api',
    action: 'ERASE_PERSONAL_DATA', entity: 'player_registrations', entity_id: reg.id,
    details: { reason: String(req.body.reason).slice(0, 300), records: { workflow: data.workflow.length, candidates: data.trialCandidates.length } },
  }).then(({ error }) => error && error.code !== 'PGRST205' && Promise.reject(error));

  res.json({ success: true, erased: { registration: 1, workflow: data.workflow.length, candidates: data.trialCandidates.length } });
};

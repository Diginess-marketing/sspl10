import supabase from '../config/supabase.js';

export const TABLE = 'trial_candidates';

/**
 * Project a paid registration onto a trial candidate row.
 * The registration id is reused as the candidate id, which makes the upsert
 * below idempotent when a webhook is delivered more than once.
 */
export function fromRegistration(registration, paymentId) {
  return {
    id: registration.id,
    registration_id: registration.id,
    name: registration.full_name,
    email: registration.email,
    mobile: registration.phone,
    state: registration.state,
    proficiency: registration.position,
    payment_status: 'captured',
    payment_id: paymentId,
    status: 'ACTIVE',
  };
}

/** Insert or update candidates, keyed on id. */
export async function upsertMany(candidates) {
  if (!candidates.length) return;
  const { error } = await supabase.from(TABLE).upsert(candidates, { onConflict: 'id' });
  if (error) throw error;
}

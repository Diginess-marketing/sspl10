const supabase = require('../config/supabase');

const TABLE = 'player_registrations';

const PAID_UPDATE = {
  payment_status: 'captured',
  status: 'paid',
};

/** Fetch a single registration by id. Returns null when not found. */
async function findById(id) {
  const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single();
  if (error) return null;
  return data;
}

/** All registrations belonging to a team. */
async function findByTeamId(teamId) {
  const { data, error } = await supabase.from(TABLE).select('*').eq('team_id', teamId);
  if (error) throw error;
  return data || [];
}

/** The team a registration belongs to, or null for individual entries. */
async function findTeamId(registrationId) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('team_id')
    .eq('id', registrationId)
    .single();
  if (error || !data) return null;
  return data.team_id || null;
}

/** Look up registrations by their Razorpay payment ids (used by reconciliation). */
async function findByPaymentIds(paymentIds) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('razorpay_payment_id, payment_status, id')
    .in('razorpay_payment_id', paymentIds);
  if (error) throw error;
  return data || [];
}

/** Mark one registration as paid. `amount` is optional (webhook path only). */
async function markPaid(registrationId, { paymentId, orderId, amount }) {
  const update = {
    ...PAID_UPDATE,
    razorpay_payment_id: paymentId,
    razorpay_order_id: orderId,
    ...(amount === undefined ? {} : { payment_amount: amount }),
  };
  const { error } = await supabase.from(TABLE).update(update).eq('id', registrationId);
  if (error) throw error;
}

/** Mark every registration in a team as paid. */
async function markTeamPaid(teamId, { paymentId, orderId, amount }) {
  const update = {
    ...PAID_UPDATE,
    razorpay_payment_id: paymentId,
    razorpay_order_id: orderId,
    ...(amount === undefined ? {} : { payment_amount: amount }),
  };
  const { error } = await supabase.from(TABLE).update(update).eq('team_id', teamId);
  if (error) throw error;
}

/** Every registered email address, de-duplicated. */
async function listEmails() {
  const { data, error } = await supabase.from(TABLE).select('email');
  if (error) throw error;
  return [...new Set((data || []).map((row) => row.email).filter(Boolean))];
}

/** Registrations still awaiting payment that were created inside a window. */
async function findPendingBetween(startIso, endIso) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('email, phone, payment_status, created_at')
    .eq('payment_status', 'pending')
    .gte('created_at', startIso)
    .lte('created_at', endIso);
  if (error) throw error;
  return data || [];
}

module.exports = {
  TABLE,
  findById,
  findByTeamId,
  findTeamId,
  findByPaymentIds,
  markPaid,
  markTeamPaid,
  listEmails,
  findPendingBetween,
};

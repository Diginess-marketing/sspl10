const supabase = require('../config/supabase');

const TABLE = 'email_logs';

/**
 * Record the outcome of a send.
 * @param {{recipientEmail:string, recipientName?:string, type:string,
 *          success:boolean, error?:string}} entry
 */
async function insert({ recipientEmail, recipientName, type, success, error: errorMessage }) {
  const { error } = await supabase.from(TABLE).insert({
    recipient_email: recipientEmail,
    recipient_name: recipientName || recipientEmail.split('@')[0],
    email_type: type,
    status: success ? 'success' : 'failed',
    error_message: success ? null : errorMessage,
    sent_at: new Date().toISOString(),
  });
  if (error) throw error;
}

/** One page of send logs, newest first. */
async function paginate({ page = 1, limit = 50, type }) {
  const offset = (page - 1) * limit;

  let query = supabase
    .from(TABLE)
    .select('*', { count: 'exact' })
    .order('sent_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (type) query = query.eq('email_type', type);

  const { data, count, error } = await query;
  if (error) throw error;
  return { data: data || [], count: count || 0 };
}

/** Sends of a given type to an address since a time — used to avoid re-sending. */
async function findSentSince(email, type, sinceIso) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('id')
    .eq('recipient_email', email)
    .eq('email_type', type)
    .gte('sent_at', sinceIso);
  if (error) throw error;
  return data || [];
}

module.exports = { TABLE, insert, paginate, findSentSince };

import supabase from '../config/supabase.js';

export const TABLE = 'razorpay_ledger';

/** Supabase caps a single response at 1000 rows; paging uses this window. */
export const PAGE_SIZE = 1000;

/**
 * Apply the shared admin filters to a query builder.
 * @param {Object} query Supabase query builder.
 * @param {{status?:string, search?:string, from?:string, to?:string}} filters
 */
function applyFilters(query, { status, search, from, to } = {}) {
  let q = query;
  if (status) q = q.eq('status', status);
  if (search) q = q.or(`email.ilike.%${search}%,payment_id.ilike.%${search}%`);
  if (from) q = q.gte('created_at', from);
  if (to) q = q.lte('created_at', to);
  return q;
}

/** Insert or update ledger rows, keyed on payment_id. */
export async function upsertMany(records) {
  if (!records.length) return [];
  const { data, error } = await supabase
    .from(TABLE)
    .upsert(records, { onConflict: 'payment_id' })
    .select();
  if (error) throw error;
  return data || [];
}

/** One page of transactions, newest first, plus the total row count. */
export async function paginate({ page = 1, limit = 50, filters = {} }) {
  const start = (page - 1) * limit;
  const query = applyFilters(
    supabase
      .from(TABLE)
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(start, start + limit - 1),
    filters
  );

  const { data, error, count } = await query;
  if (error) throw error;
  return { data: data || [], count: count || 0 };
}

/**
 * Every row matching the filters, paged past Supabase's 1000-row ceiling.
 * @param {Object} filters
 * @param {Object} [options]
 * @param {string} [options.columns='*'] Columns to select.
 * @param {boolean} [options.ordered=true] Order by created_at descending.
 */
export async function fetchAll(filters = {}, { columns = '*', ordered = true } = {}) {
  const all = [];
  let page = 0;

  for (;;) {
    let query = supabase
      .from(TABLE)
      .select(columns)
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);
    if (ordered) query = query.order('created_at', { ascending: false });

    const { data, error } = await applyFilters(query, filters);
    if (error) throw error;
    if (!data || data.length === 0) break;

    all.push(...data);
    if (data.length < PAGE_SIZE) break;
    page += 1;
  }

  return all;
}

/** De-duplicated email addresses for every payment with the given status. */
export async function listEmailsByStatus(status) {
  const { data, error } = await supabase.from(TABLE).select('email').eq('status', status);
  if (error) throw error;
  return [...new Set((data || []).map((row) => row.email).filter(Boolean))];
}

/**
 * Payments that never completed (failed, or created and abandoned) inside a
 * time window — the candidate pool for reminder emails.
 */
export async function findIncompleteBetween(startIso, endIso) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('email, contact, status, created_at, payment_id')
    .or('status.eq.failed,status.eq.created')
    .gte('created_at', startIso)
    .lte('created_at', endIso);
  if (error) throw error;
  return data || [];
}

/** Successful payments for an email address since a given time. */
export async function findSuccessfulSince(email, sinceIso) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('payment_id')
    .eq('email', email)
    .or('status.eq.captured,status.eq.authorized')
    .gte('created_at', sinceIso);
  if (error) throw error;
  return data || [];
}

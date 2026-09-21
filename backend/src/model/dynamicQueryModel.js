import supabase from '../config/supabase.js';
import ApiError from '../utils/ApiError.js';

/**
 * Tables the AI query endpoint may read. The query descriptor comes from an
 * LLM, so the table name is never trusted — anything outside this list is
 * rejected rather than passed through to Supabase.
 */
export const ALLOWED_TABLES = new Set([
  'player_registrations',
  'teams',
  'trial_candidates',
  'razorpay_ledger',
  'email_logs',
  'chat_logs',
]);

export const ALLOWED_OPERATORS = new Set(['eq', 'ilike', 'in', 'gt', 'lt', 'gte', 'lte']);

const DEFAULT_TABLE = 'player_registrations';
const DEFAULT_LIMIT = 500;
const MAX_LIMIT = 5000;

/** Column and select lists must look like identifiers, not expressions. */
const SELECT_PATTERN = /^(\*|[a-z0-9_]+(\s*,\s*[a-z0-9_]+)*)$/i;
const COLUMN_PATTERN = /^[a-z0-9_]+$/i;

/**
 * Validate and normalise an LLM-produced query descriptor.
 * @returns {{table:string, select:string, filters:Array, order:Object|null, limit:number}}
 */
export function sanitize(descriptor = {}) {
  const table = descriptor.table || DEFAULT_TABLE;
  if (!ALLOWED_TABLES.has(table)) {
    throw ApiError.badRequest(`Querying table '${table}' is not allowed`);
  }

  const select = descriptor.select || '*';
  if (!SELECT_PATTERN.test(select)) {
    throw ApiError.badRequest('Invalid select list');
  }

  const filters = (Array.isArray(descriptor.filters) ? descriptor.filters : []).filter(
    (f) => f && COLUMN_PATTERN.test(f.column || '') && ALLOWED_OPERATORS.has(f.operator)
  );

  const order =
    descriptor.order && COLUMN_PATTERN.test(descriptor.order.column || '')
      ? { column: descriptor.order.column, ascending: Boolean(descriptor.order.ascending) }
      : null;

  const limit = Math.min(Number(descriptor.limit) || DEFAULT_LIMIT, MAX_LIMIT);

  return { table, select, filters, order, limit };
}

/**
 * Run a sanitized query descriptor against Supabase.
 * @returns {Promise<{query:Object, data:Array}>} The sanitized query and its rows.
 */
export async function run(descriptor) {
  const query = sanitize(descriptor);

  let sbQuery = supabase.from(query.table).select(query.select);

  for (const filter of query.filters) {
    sbQuery = sbQuery[filter.operator](filter.column, filter.value);
  }

  sbQuery = query.order
    ? sbQuery.order(query.order.column, { ascending: query.order.ascending })
    : sbQuery.order('created_at', { ascending: false });

  const { data, error } = await sbQuery.limit(query.limit);
  if (error) throw ApiError.internal(error.message);

  return { query, data: data || [] };
}

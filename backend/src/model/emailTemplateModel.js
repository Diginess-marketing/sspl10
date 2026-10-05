import supabase from '../config/supabase.js';

export const TABLE = 'email_templates';

export async function list() {
  const { data, error } = await supabase.from(TABLE).select('*').order('key');
  if (error) throw error;
  return data || [];
}

export async function findByKey(key) {
  const { data, error } = await supabase.from(TABLE).select('*').eq('key', key).maybeSingle();
  if (error) throw error;
  return data;
}

export async function upsert(template) {
  const { data, error } = await supabase
    .from(TABLE)
    .upsert({ ...template, updated_at: new Date().toISOString() }, { onConflict: 'key' })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

import { createHash } from 'node:crypto';
import supabase from '../config/supabase.js';
import logger from '../utils/logger.js';

/**
 * A candidate with their progress row and the contact details from the registration
 * (trial_candidates has no city, and its email can be empty).
 * @returns {Promise<{candidate:Object, progress:Object|null, contact:Object}|null>}
 */
export async function findCandidate(candidateId) {
  const { data: candidate, error } = await supabase
    .from('trial_candidates')
    .select('*')
    .eq('id', candidateId)
    .maybeSingle();
  if (error) throw error;
  if (!candidate) return null;

  const [{ data: progress, error: pErr }, { data: registration, error: rErr }] = await Promise.all([
    supabase.from('trial_progress').select('*').eq('candidate_id', candidateId).maybeSingle(),
    candidate.registration_id
      ? supabase.from('player_registrations').select('full_name, email, phone, city').eq('id', candidate.registration_id).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);
  if (pErr) throw pErr;
  if (rErr) throw rErr;

  return {
    candidate,
    progress,
    contact: {
      name: candidate.name || registration?.full_name || '',
      email: candidate.email || registration?.email || '',
      phone: candidate.mobile || registration?.phone || '',
      city: registration?.city || '',
    },
  };
}

/**
 * Write progress columns for a candidate (creates the row if missing). Returns the saved row.
 * Columns the table does not have yet (L4/L5, marks, remarks before the pending migration)
 * are left out rather than failing the whole save.
 */
export async function saveProgress(candidateId, update) {
  const row = { candidate_id: candidateId, ...update, updated_at: new Date().toISOString() };
  for (;;) {
    const { data, error } = await supabase
      .from('trial_progress')
      .upsert(row, { onConflict: 'candidate_id' })
      .select('*')
      .single();
    const missing = error?.code === 'PGRST204' && /the '([^']+)' column/.exec(error.message)?.[1];
    if (missing && missing in row && missing !== 'candidate_id') {
      logger.warn(`trial_progress has no ${missing} column yet; run the pending migration`);
      delete row[missing];
      continue;
    }
    if (error) throw error;
    return data;
  }
}

/** The trial candidate for a registration: by registration id, else by the last 10 digits of the mobile. */
export async function findCandidateIdForRegistration(registrationId, phone) {
  const { data: byReg, error } = await supabase
    .from('trial_candidates').select('id').eq('registration_id', registrationId).limit(1);
  if (error) throw error;
  if (byReg?.length) return byReg[0].id;
  const mobile = String(phone || '').replace(/D/g, '').slice(-10);
  if (mobile.length !== 10) return null;
  const { data: byPhone, error: pErr } = await supabase
    .from('trial_candidates').select('id').ilike('mobile', `%${mobile}`).limit(1);
  if (pErr) throw pErr;
  return byPhone?.[0]?.id ?? null;
}

export async function findLevelEmail(candidateId, level, outcome) {
  const { data, error } = await supabase
    .from('trial_level_emails')
    .select('*')
    .match({ candidate_id: candidateId, level, outcome })
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function recordLevelEmail(entry) {
  const { error } = await supabase
    .from('trial_level_emails')
    .upsert({ ...entry, sent_at: new Date().toISOString() }, { onConflict: 'candidate_id,level,outcome' });
  if (error) throw error;
}

// PostgREST "table not in schema cache" / Postgres "relation does not exist"
const isMissingTable = (error) => error?.code === 'PGRST205' || error?.code === '42P01';

/**
 * Until the trial_certificates migration has been run there is nowhere to store numbers.
 * The certificate is then issued unsaved, with a number derived from candidate/level/kind
 * so repeated downloads show the same number.
 */
function unsavedCertificate({ candidateId, level, kind, playerName }) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const hash = createHash('sha256').update(`${candidateId}:${level}:${kind}`).digest();
  let suffix = '';
  for (let i = 0; i < 6; i += 1) suffix += alphabet[hash[i] % alphabet.length];
  return {
    certificate_no: `SSPL-L${level}-${kind === 'achievement' ? 'A' : 'P'}-${suffix}`,
    candidate_id: candidateId,
    level,
    kind,
    player_name: playerName,
    issued_at: new Date().toISOString(),
    unsaved: true,
  };
}

/** The certificate for a candidate/level/kind, issuing a number the first time. */
export async function findOrCreateCertificate({ candidateId, level, kind, playerName, newNumber }) {
  const { data: existing, error } = await supabase
    .from('trial_certificates')
    .select('*')
    .match({ candidate_id: candidateId, level, kind })
    .maybeSingle();
  if (isMissingTable(error)) {
    logger.warn('trial_certificates table missing; run the pending migration. Issuing an unsaved certificate.');
    return unsavedCertificate({ candidateId, level, kind, playerName });
  }
  if (error) throw error;
  if (existing) return existing;

  const { data, error: insErr } = await supabase
    .from('trial_certificates')
    .insert({ certificate_no: newNumber(), candidate_id: candidateId, level, kind, player_name: playerName })
    .select('*')
    .single();
  if (insErr) throw insErr;
  return data;
}

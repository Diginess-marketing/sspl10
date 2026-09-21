import fs from 'fs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function syncMissing() {
  const { data: regs, error: err1 } = await supabase.from('player_registrations').select('*').in('payment_status', ['captured', 'completed', 'paid', 'success']);
  if (err1) throw err1;
  const { data: cands, error: err2 } = await supabase.from('trial_candidates').select('mobile');
  if (err2) throw err2;
  
  const candPhones = new Set(cands.map(c => c.mobile.replace(/\D/g, '').slice(-10)));
  
  const missing = [];
  for (const r of regs) {
    if (!r.phone) continue;
    const phone = r.phone.replace(/\D/g, '').slice(-10);
    // Ignore test entries
    if (['9150247561', '9003677496', '8072053552'].includes(phone)) continue;
    if (r.full_name && r.full_name.toLowerCase().includes('test')) continue;

    if (!candPhones.has(phone)) {
      missing.push(r);
      candPhones.add(phone); // Avoid duplicates
    }
  }
  
  console.log('Found', missing.length, 'missing registrations.');
  if (missing.length > 0) {
    console.log(missing.map(m => m.full_name));

    // Let's insert them into trial_candidates
    for (const m of missing) {
      const { data: insertedCandidate, error: iErr } = await supabase.from('trial_candidates').insert({
        registration_id: m.id,
        name: m.full_name,
        mobile: m.phone,
        email: m.email,
        state: m.state,
        proficiency: m.position,
        payment_status: m.payment_status,
        imported_at: new Date().toISOString()
      }).select().single();

      if (iErr) {
        console.error('Failed to insert candidate:', m.full_name, iErr);
        continue;
      }

      // Automatically create trial_progress for the candidate
      const { error: pErr } = await supabase.from('trial_progress').insert({
        candidate_id: insertedCandidate.id,
        current_level: 1,
        l1_called: false,
        l1_attendance: 'PENDING',
        l1_result: 'PENDING',
        l2_called: false,
        l3_called: false
      });

      if (pErr) {
        console.error('Failed to insert progress for:', m.full_name, pErr);
      } else {
        console.log('Successfully synced:', m.full_name);
      }
    }
  }
}
syncMissing();

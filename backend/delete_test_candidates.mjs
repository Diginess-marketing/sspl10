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

async function removeTestRecords() {
  const { data: recordsToDel, error: fetchErr } = await supabase
    .from('trial_candidates')
    .select('id, name, mobile, email')
    .or('mobile.ilike.%9790743413%,mobile.ilike.%9444183183%,mobile.ilike.%7871808328%,email.ilike.%jdian0207@gmail.co.in%,email.ilike.%remo_jeni@yahoo.co.in%');

  if (fetchErr) {
    console.error('Error fetching:', fetchErr);
    return;
  }

  console.log('Records to delete from trial_candidates:', recordsToDel);

  if (recordsToDel && recordsToDel.length > 0) {
    const ids = recordsToDel.map(r => r.id);
    
    // Delete from trial_progress first
    await supabase.from('trial_progress').delete().in('candidate_id', ids);
    
    const { data: delData, error: delErr } = await supabase
      .from('trial_candidates')
      .delete()
      .in('id', ids);

    if (delErr) {
      console.error('Error deleting:', delErr);
    } else {
      console.log('Successfully deleted trial_candidates records:', ids.length);
    }
  } else {
    console.log('No records found to delete in trial_candidates.');
  }
}
removeTestRecords();

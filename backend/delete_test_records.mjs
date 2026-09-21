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
    .from('player_registrations')
    .select('id, full_name, phone, email')
    .or('phone.in.(+919790743413,9790743413,+919444183183,9444183183,+917871808328,7871808328),email.in.(jdian0207@gmail.co.in,remo_jeni@yahoo.co.in)');

  if (fetchErr) {
    console.error('Error fetching:', fetchErr);
    return;
  }

  console.log('Records to delete:', recordsToDel);

  if (recordsToDel && recordsToDel.length > 0) {
    const ids = recordsToDel.map(r => r.id);
    
    // Delete from child tables to respect foreign keys
    await supabase.from('player_workflow').delete().in('registration_id', ids);
    await supabase.from('selection_workflow').delete().in('registration_id', ids);
    await supabase.from('registrations').delete().in('registration_id', ids);
    
    const { data: delData, error: delErr } = await supabase
      .from('player_registrations')
      .delete()
      .in('id', ids);

    if (delErr) {
      console.error('Error deleting:', delErr);
    } else {
      console.log('Successfully deleted test records:', ids.length);
    }
  } else {
    console.log('No records found to delete.');
  }
}
removeTestRecords();

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

async function check() {
  const { count } = await supabase.from('trial_progress').select('*', { count: 'exact', head: true });
  console.log('Total in trial_progress:', count);
  
  const { count: c1 } = await supabase.from('trial_progress').select('*', { count: 'exact', head: true }).eq('l1_called', false);
  console.log('l1_called = false in trial_progress:', c1);

  const { count: c2 } = await supabase.from('trial_progress').select('*', { count: 'exact', head: true }).eq('l1_called', true);
  console.log('l1_called = true in trial_progress:', c2);
}
check();

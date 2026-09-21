import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkEmailsOnDate() {
  const { data, error } = await supabase
    .from('email_logs')
    .select('status, error_message, sent_at')
    .gte('sent_at', '2026-06-23T00:00:00Z')
    .lt('sent_at', '2026-06-24T00:00:00Z');

  if (error) {
    console.error("Error querying email_logs:", error);
    return;
  }

  console.log(`Found ${data.length} emails sent on 23rd June 2026.`);
  
  const failed = data.filter(d => d.status === 'failed' || d.error_message);
  console.log(`Failed out of these: ${failed.length}`);
  if (failed.length > 0) {
      console.log("Samples:");
      console.log(failed.slice(0, 5));
  }
}

checkEmailsOnDate();

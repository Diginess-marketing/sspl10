import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkFailedEmails() {
  const { data, error } = await supabase
    .from('email_logs')
    .select('recipient_name, recipient_email, error_message, sent_at')
    .eq('status', 'failed')
    .order('sent_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error("Error querying email_logs:", error);
    return;
  }

  console.log(`Top 20 failed email logs (all time):`);
  console.table(data);
}

checkFailedEmails();

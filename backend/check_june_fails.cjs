const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase
    .from('email_logs')
    .select('*')
    .gte('sent_at', '2026-06-01T00:00:00Z')
    .lt('sent_at', '2026-07-01T00:00:00Z')
    .neq('status', 'success');

  if (error) {
    console.error(error);
    return;
  }
  
  console.log(`Found ${data.length} failed emails in June 2026.`);
  if (data.length > 0) {
      console.log('Failed recipients:');
      console.table(data.map(f => ({ email: f.recipient_email, type: f.email_type, date: f.sent_at })).slice(0, 10));
      const fs = require('fs');
      fs.writeFileSync('failed_june.json', JSON.stringify(data, null, 2));
  }
}

run();

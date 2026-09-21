const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase
    .from('email_logs')
    .select('*')
    .eq('email_type', 'bulk_campaign')
    .order('sent_at', { ascending: false });

  if (error) {
    console.error(error);
    return;
  }
  
  const success = data.filter(d => d.status === 'success');
  const failed = data.filter(d => d.status !== 'success');
  
  console.log('TOTAL bulk_campaign:', data.length);
  console.log('SUCCESS:', success.length);
  console.log('FAILED:', failed.length);
  
  if (failed.length > 0) {
      console.log('Failed recipients:');
      console.table(failed.map(f => ({ email: f.recipient_email, date: f.sent_at, error: f.error_message })).slice(0, 10));
      
      const fs = require('fs');
      fs.writeFileSync('failed_bulk_campaign.json', JSON.stringify(failed, null, 2));
      console.log('Saved to failed_bulk_campaign.json');
  }
}

run();

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkWebhooks() {
  const { data: logs, error } = await supabase
    .from('razorpay_ledger')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500);
    
  if (error) {
    console.log('Error fetching razorpay_ledger:', error);
  } else {
    // See if any log has this phone number in payload
    const matching = logs.filter(log => {
      const payloadStr = JSON.stringify(log);
      return payloadStr.includes('lakhichan29@gmail.com');
    });
    console.log('Matching Ledger Logs:', JSON.stringify(matching, null, 2));
  }
}
checkWebhooks();

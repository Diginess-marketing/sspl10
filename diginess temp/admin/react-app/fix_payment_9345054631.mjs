import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixPayment() {
  const { data: successData } = await supabase
    .from('player_registrations')
    .select('status, payment_status')
    .eq('payment_status', 'captured')
    .limit(1);
    
  console.log('Sample successful registration:', successData);
  
  const targetStatus = successData[0]?.status || 'pending';
  
  const { data, error } = await supabase
    .from('player_registrations')
    .update({ 
      payment_status: 'captured', 
      status: targetStatus,
      amount_paid: 1179
    })
    .eq('phone', '9345054631')
    .select();
    
  if (error) {
    console.log('Error updating registration:', error);
  } else {
    console.log('Successfully updated registration:', data);
  }
}
fixPayment();

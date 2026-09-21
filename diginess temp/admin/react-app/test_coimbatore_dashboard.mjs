import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testDashboardLogic() {
  const { data: regsData, error } = await supabase
    .from('player_registrations')
    .select('full_name, phone, email, city, state, status, payment_status, school_name, created_at, utm_source, utm_campaign')
    .or('utm_source.ilike.%karthikeyan%,utm_campaign.ilike.%coimbatore%');

  if (error) {
    console.error("Supabase fetch error:", error);
    return;
  }
  
  const filteredRegs = regsData;

  let successfulDBRegistrations = 0;
  let failedDBRegistrations = 0;
  let successfulPhones = [];
  let failedPhones = [];

  filteredRegs.forEach((r) => {
    const isSuccessful = r.payment_status === 'captured' || 
                         r.payment_status === 'paid' || 
                         r.payment_status === 'success' ||
                         r.payment_status === 'completed';
    
    if (isSuccessful) {
      successfulDBRegistrations++;
      successfulPhones.push({ phone: r.phone, payment_status: r.payment_status, city: r.city, state: r.state, email: r.email });
    } else {
      failedDBRegistrations++;
      failedPhones.push({ phone: r.phone, payment_status: r.payment_status, city: r.city, state: r.state, email: r.email });
    }
  });

  console.log(`Total matching UTM: ${regsData.length}`);
  console.log(`Total after city/state filter: ${filteredRegs.length}`);
  console.log(`Successful: ${successfulDBRegistrations}`);
  console.log(`Failed: ${failedDBRegistrations}`);
  console.log('Failed phones:', failedPhones);
}

testDashboardLogic();

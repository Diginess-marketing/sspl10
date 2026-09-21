import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkCounts() {
      const { count: capturedTransCount } = await supabase.from('player_registrations')
        .select('*', { count: 'exact', head: true })
        .in('payment_status', ['captured', 'completed', 'paid', 'success', 'CAPTURED', 'COMPLETED', 'PAID', 'SUCCESS']);
      console.log(`Captured Payments (Total IN Players): ${capturedTransCount}`);
}
checkCounts();

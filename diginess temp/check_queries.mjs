import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const q1 = await supabase.from('trial_view').select('candidate_id', { count: 'exact', head: true }).eq('l3_result', 'SELECTED');
  console.log("Finally Selected:", q1.count);

  const q2 = await supabase.from('trial_view').select('candidate_id', { count: 'exact', head: true }).eq('l2_result', 'SELECTED').neq('l3_result', 'SELECTED').neq('l3_attendance', 'ABSENT');
  console.log("Level 2 Selected (Attended L3 but not selected):", q2.count);
  
  const q2b = await supabase.from('trial_view').select('candidate_id', { count: 'exact', head: true }).eq('l2_result', 'SELECTED').neq('l3_result', 'SELECTED').neq('l3_result', 'REJECTED');
  console.log("Level 2 Selected (Any L3 non-processed):", q2b.count);

  const q3 = await supabase.from('trial_view').select('candidate_id', { count: 'exact', head: true }).eq('l2_attendance', 'ATTENDED').eq('l3_attendance', 'ABSENT');
  console.log("Level 3 Absent (Attended L2, Absent L3):", q3.count);

  const q4 = await supabase.from('trial_view').select('candidate_id', { count: 'exact', head: true }).eq('l1_attendance', 'ABSENT').neq('l2_attendance', 'ATTENDED').neq('l3_attendance', 'ATTENDED');
  console.log("Completely Absent:", q4.count);

  const q5 = await supabase.from('trial_view').select('candidate_id', { count: 'exact', head: true }).eq('l1_called', false);
  console.log("Not Called:", q5.count);
}
check();

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkCounts() {
  const [
    { count: count0 },
    { count: count1 },
    { count: count2 },
    { count: count3 },
    { count: l1CalledCount },
    { count: totalTrialCandidatesCount }
  ] = await Promise.all([
    supabase.from('trial_view').select('*', { count: 'exact', head: true }).eq('l1_attendance', 'ABSENT').eq('l2_attendance', 'ABSENT').eq('l3_attendance', 'ABSENT'),
    supabase.from('trial_view').select('*', { count: 'exact', head: true }).eq('l1_result', 'SELECTED').eq('l2_result', 'SELECTED').eq('l3_result', 'SELECTED'),
    supabase.from('trial_view').select('*', { count: 'exact', head: true }).eq('l1_result', 'SELECTED').eq('l2_attendance', 'ABSENT').eq('l3_attendance', 'ABSENT'),
    supabase.from('trial_view').select('*', { count: 'exact', head: true }).eq('l1_result', 'SELECTED').eq('l2_result', 'SELECTED').eq('l3_attendance', 'ABSENT'),
    supabase.from('trial_view').select('*', { count: 'exact', head: true }).eq('l1_called', true),
    supabase.from('trial_view').select('*', { count: 'exact', head: true })
  ]);

  console.log(`count0: ${count0}`);
  console.log(`count1: ${count1}`);
  console.log(`count2: ${count2}`);
  console.log(`count3: ${count3}`);
  const notCalled = Math.max(0, totalTrialCandidatesCount - l1CalledCount);
  console.log(`notCalled: ${notCalled}`);
  
  console.log(`Sum: ${count0 + count1 + count2 + count3 + notCalled}`);
}

checkCounts();

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkCounts() {
  let allTrials = [];
  let page = 0;
  while(true) {
    const { data, error } = await supabase.from('trial_view').select('*').in('payment_status', ['captured', 'success', 'completed', 'paid']).range(page*1000, (page+1)*1000-1);
    if(error) throw error;
    if(!data || data.length === 0) break;
    allTrials = allTrials.concat(data);
    page++;
  }
  
  console.log(`Total captured trials: ${allTrials.length}`);

  const finallySelected = allTrials.filter(t => t.l3_result === 'SELECTED');
  // the exact condition from sync_1509: l1_attendance = 'ABSENT'
  const completelyAbsent = allTrials.filter(t => t.l1_attendance === 'ABSENT');
  const notCalled = allTrials.filter(t => t.trial_status === 'Pending' || !t.l1_called);
  
  // What remains?
  const accountedIds = new Set([...finallySelected, ...completelyAbsent, ...notCalled].map(t => t.candidate_id));
  const remaining = allTrials.filter(t => !accountedIds.has(t.candidate_id));
  
  console.log(`Finally Selected: ${finallySelected.length}`);
  console.log(`Completely Absent: ${completelyAbsent.length}`);
  console.log(`Not Called: ${notCalled.length}`);
  console.log(`Remaining to split between L2 Selected and L3 Absent: ${remaining.length}`);
  
  const l3Absent = remaining.filter(t => t.l3_attendance === 'ABSENT');
  console.log(`L3 Absent from remaining: ${l3Absent.length}`);
  
  const l2Selected = remaining.filter(t => t.l2_result === 'SELECTED');
  console.log(`L2 Selected from remaining: ${l2Selected.length}`);

  const leftover = remaining.filter(t => t.l3_attendance !== 'ABSENT' && t.l2_result !== 'SELECTED');
  console.log(`Leftover: ${leftover.length}`);
}

checkCounts();

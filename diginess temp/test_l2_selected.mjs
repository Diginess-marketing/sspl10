import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkCounts() {
  let allTrials = [];
  let page = 0;
  while(true) {
    const { data, error } = await supabase.from('trial_view').select('*').range(page*1000, (page+1)*1000-1);
    if(error) throw error;
    if(!data || data.length === 0) break;
    allTrials = allTrials.concat(data);
    page++;
  }
  
  // Categories:
  // 1. Finally Selected
  const finallySelected = allTrials.filter(t => t.l3_result === 'SELECTED');
  
  // 2. Level 2 Selected (but not finally selected)
  // Let's assume the user means l2_result === 'SELECTED' but they didn't get selected in L3
  const level2Selected = allTrials.filter(t => t.l2_result === 'SELECTED' && t.l3_result !== 'SELECTED');
  
  // 3. Level 3 Absent
  const l3Absent = allTrials.filter(t => t.l3_attendance === 'ABSENT');
  
  // 4. Completely Absent (L1 absent)
  const completelyAbsent = allTrials.filter(t => t.l1_attendance === 'ABSENT');
  
  // 5. Not Called
  const notCalled = allTrials.filter(t => !t.l1_called);

  console.log(`Finally Selected: ${finallySelected.length}`);
  console.log(`Level 2 Selected: ${level2Selected.length}`);
  console.log(`Level 3 Absent: ${l3Absent.length}`);
  console.log(`Completely Absent: ${completelyAbsent.length}`);
  console.log(`Not Called: ${notCalled.length}`);
  
  const total = finallySelected.length + level2Selected.length + l3Absent.length + completelyAbsent.length + notCalled.length;
  console.log(`Sum of these: ${total}`);
}

checkCounts();

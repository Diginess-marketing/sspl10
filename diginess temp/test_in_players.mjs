import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function main() {
  let allData = [];
  let page = 0;
  let limit = 1000;
  let hasMore = true;
  
  while (hasMore) {
      const { data, error } = await supabase.from('trial_progress').select('*').range(page * limit, (page + 1) * limit - 1);
      if (data && data.length > 0) {
          allData = allData.concat(data);
          page++;
      } else {
          hasMore = false;
      }
  }
  
  const data = allData;
  
  let finallySelected = 0;
  let level2Selected = 0;
  let level3Absent = 0;
  let completelyAbsent = 0;
  let notCalled = 0;
  let totalIn = 0;
  
  let totalRejected = 0;
  
  for (const p of data) {
    let status = 'PENDING';
    
    // Apply dynamic business logic as in UI
    if (p.l3_result === 'SELECTED') {
      status = 'SELECTED';
      finallySelected++;
    } else if (p.l1_result === 'REJECTED' || p.l2_result === 'REJECTED' || p.l3_result === 'REJECTED') {
      status = 'REJECTED';
    } else if (p.l1_attendance === 'ABSENT' || p.l2_attendance === 'ABSENT' || p.l3_attendance === 'ABSENT') {
      status = 'ABSENT'; // Temporary tracking
    }
    
    // Check specific user categories
    if (status !== 'SELECTED' && status !== 'REJECTED') {
       // Not Called
       if (!p.l1_called) {
           notCalled++;
       }
       else if (p.l1_attendance === 'ABSENT' && p.l2_attendance !== 'ATTENDED' && p.l3_attendance !== 'ATTENDED') {
           completelyAbsent++;
       }
       else if (p.l3_attendance === 'ABSENT') {
           level3Absent++;
       }
       else if (p.l2_result === 'SELECTED' && p.l3_result !== 'SELECTED' && p.l3_result !== 'REJECTED') {
           level2Selected++;
       }
    }
    
    if (status !== 'REJECTED') {
       totalIn++;
    } else {
       totalRejected++;
    }
  }
  
  console.log(`Total Trial Progress Records: ${data.length}`);
  console.log(`Finally Selected (L3 Selected): ${finallySelected}`);
  console.log(`Level 2 Selected (but not L3 processed): ${level2Selected}`);
  console.log(`Level 3 Absent: ${level3Absent}`);
  console.log(`Completely Absent: ${completelyAbsent}`);
  console.log(`Not Called: ${notCalled}`);
  console.log(`Total IN Players (non-rejected): ${totalIn}`);
  console.log(`Total OUT (Rejected): ${totalRejected}`);
}

main();

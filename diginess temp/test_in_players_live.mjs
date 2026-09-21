import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkInPlayers() {
  try {
    // 1. Fetch total paid players and total rejected
    const { count: totalPaid } = await supabase
      .from('registration_import_staging')
      .select('*', { count: 'exact', head: true })
      .eq('payment_status', 'SUCCESS');

    const { count: totalRejected } = await supabase
      .from('trial_workflow_view')
      .select('*', { count: 'exact', head: true })
      .eq('selection_status', 'Rejected');

    console.log(`Total Paid Players (Trial Pool): ${totalPaid}`);
    console.log(`Total Rejected: ${totalRejected}`);
    
    const inPlayersTotal = totalPaid - totalRejected;
    console.log(`Expected Total IN Players: ${inPlayersTotal}`);

    // 2. Fetch trialsList
    const { data: trialsList, error } = await supabase
      .from('trial_workflow_view')
      .select('*')
      .neq('selection_status', 'Rejected');
    
    if (error) throw error;

    const notCalledCount = trialsList.filter(t => t.trial_status === 'Pending').length;
    const fullyAbsentCount = trialsList.filter(t => t.l1_attendance === 'Absent').length;
    const level2AbsentCount = trialsList.filter(t => t.l2_attendance === 'Absent').length;
    const level3AbsentCount = trialsList.filter(t => t.l3_attendance === 'Absent').length;

    console.log(`Not Called: ${notCalledCount}`);
    console.log(`Level 1 (Fully) Absent: ${fullyAbsentCount}`);
    console.log(`Level 2 Absent: ${level2AbsentCount}`);
    console.log(`Level 3 Absent: ${level3AbsentCount}`);

    const inStationCount = inPlayersTotal - level3AbsentCount - level2AbsentCount - fullyAbsentCount - notCalledCount;
    
    console.log(`Calculated Finally Selected (inStationCount): ${inStationCount}`);
    
    // Calculate the others in IN Players Split
    const l2Selected = inPlayersTotal - inStationCount - level3AbsentCount - fullyAbsentCount - notCalledCount;
    console.log(`L2 Selected: ${l2Selected}`);

  } catch (error) {
    console.error("Error:", error);
  }
}

checkInPlayers();

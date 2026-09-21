import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf-8');
const urlMatch = env.match(/VITE_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/);

const supabase = createClient(urlMatch[1], keyMatch[1]);

async function checkDetailedMetrics() {
    console.log("Checking detailed metrics...");

    const queries = [
        supabase.from('trial_view').select('*', { count: 'exact', head: true }).eq('l1_attendance', 'ABSENT').eq('l2_attendance', 'ABSENT').eq('l3_attendance', 'ABSENT'), // count0
        supabase.from('trial_view').select('*', { count: 'exact', head: true }).eq('l1_result', 'SELECTED').eq('l2_result', 'SELECTED').eq('l3_result', 'SELECTED'), // count1
        supabase.from('trial_view').select('*', { count: 'exact', head: true }).eq('l1_result', 'SELECTED').eq('l2_attendance', 'ABSENT').eq('l3_attendance', 'ABSENT'), // count2
        supabase.from('trial_view').select('*', { count: 'exact', head: true }).eq('l1_result', 'SELECTED').eq('l2_result', 'SELECTED').eq('l3_attendance', 'ABSENT'), // count3
        supabase.from('trial_view').select('*', { count: 'exact', head: true }).or('l1_attendance.eq.ABSENT,l2_attendance.eq.ABSENT,l3_attendance.eq.ABSENT'), // totalAbsenteesCount
        supabase.from('trial_view').select('*', { count: 'exact', head: true }).eq('l1_result', 'SELECTED'), // level1SelectedCount
        supabase.from('trial_view').select('*', { count: 'exact', head: true }).eq('l2_result', 'SELECTED'), // level2SelectedCount
        supabase.from('trial_view').select('*', { count: 'exact', head: true }).eq('l3_result', 'SELECTED'), // level3SelectedCount
        supabase.from('trial_view').select('*', { count: 'exact', head: true }).eq('final_status', 'SELECTED'), // finalSelectedCount
        supabase.from('trial_view').select('*', { count: 'exact', head: true }).eq('final_status', 'REJECTED'), // finalRejectedCount
        supabase.from('trial_view').select('*', { count: 'exact', head: true }).eq('l1_called', true), // l1CalledCount
        supabase.from('trial_view').select('*', { count: 'exact', head: true }) // totalTrialCandidatesCount
    ];

    const results = await Promise.all(queries);
    
    console.log("count0 (Completely Absent):", results[0].count);
    console.log("count1 (Finally Selected):", results[1].count);
    console.log("count2 (L2 Selected, L3 Absent):", results[2].count);
    console.log("count3 (L3 Absent):", results[3].count);
    console.log("totalAbsenteesCount:", results[4].count);
    console.log("level1SelectedCount:", results[5].count);
    console.log("level2SelectedCount:", results[6].count);
    console.log("level3SelectedCount:", results[7].count);
    console.log("finalSelectedCount:", results[8].count);
    console.log("finalRejectedCount:", results[9].count);
    console.log("l1CalledCount:", results[10].count);
    console.log("totalTrialCandidatesCount:", results[11].count);
    
    const calledForCount = results[10].count || 0;
    const notCalledForCount = Math.max(0, (results[11].count || 0) - calledForCount);
    const inStationTotal = (results[1].count || 0) + (results[2].count || 0) + (results[3].count || 0) + (results[0].count || 0) + notCalledForCount;

    console.log("--- Derived Metrics ---");
    console.log("calledForCount:", calledForCount);
    console.log("notCalledForCount:", notCalledForCount);
    console.log("inStationTotal:", inStationTotal);
    console.log("outStationTotal (finalRejectedCount):", results[9].count);
}

checkDetailedMetrics();

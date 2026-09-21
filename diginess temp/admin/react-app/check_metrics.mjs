import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf-8');
const urlMatch = env.match(/VITE_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/);

const supabase = createClient(urlMatch[1], keyMatch[1]);

async function checkMetrics() {
    console.log("Checking metrics...");

    // 1. Raw counts
    const { count: rawTotal } = await supabase.from('player_registrations').select('*', { count: 'exact', head: true });
    const { count: rawCaptured } = await supabase.from('player_registrations')
        .select('*', { count: 'exact', head: true })
        .in('payment_status', ['captured', 'completed', 'paid', 'success', 'CAPTURED', 'COMPLETED', 'PAID', 'SUCCESS']);

    console.log(`Raw Total Registrations: ${rawTotal}`);
    console.log(`Raw Captured Payments: ${rawCaptured}`);

    // 2. RPC calls
    const { data: trialStats, error: trialError } = await supabase.rpc('get_trial_overall_stats');
    if (trialError) console.error("RPC Trial Error:", trialError.message);
    else console.log("Trial Stats:", JSON.stringify(trialStats, null, 2));

    const { data: wfData, error: wfError } = await supabase.rpc('get_workflow_dashboard_stats');
    if (wfError) console.error("RPC WF Error:", wfError.message);
    else console.log("Workflow Stats:", JSON.stringify(wfData, null, 2));

    const wfStats = Array.isArray(wfData) ? wfData[0] : wfData;
    
    if (wfStats) {
        console.log(`WF Total Registrations: ${wfStats.total_registrations}`);
        console.log(`WF Captured Payments: ${wfStats.completed_payments}`);
        
        if (wfStats.total_registrations !== rawTotal) {
            console.log("⚠️ DISCREPANCY in Total Registrations!");
        }
        if (wfStats.completed_payments !== rawCaptured) {
            console.log("⚠️ DISCREPANCY in Captured Payments!");
        }
    }
}

checkMetrics();

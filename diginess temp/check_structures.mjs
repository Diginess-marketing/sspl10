import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://fazpykekypcktcmniwbj.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhenB5a2VreXBja3RjbW5pd2JqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTgyNDIzNywiZXhwIjoyMDcxNDAwMjM3fQ.b9ydyxCtsJBV90DyMnHOcyVEsfJoUSIdqTGJak3ItZU";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
    console.log("Fetching first trial candidate and progress...");
    const { data: candidates, error: cErr } = await supabase.from('trial_candidates').select('*').limit(1);
    if (cErr) console.error(cErr);
    else console.log("trial_candidates:", candidates[0]);

    const { data: progress, error: pErr } = await supabase.from('trial_progress').select('*').limit(1);
    if (pErr) console.error(pErr);
    else console.log("trial_progress:", progress[0]);

    const { data: schedules, error: sErr } = await supabase.from('trial_schedules').select('*').limit(1);
    if (sErr) console.error(sErr);
    else console.log("trial_schedules:", schedules[0]);
}

main();

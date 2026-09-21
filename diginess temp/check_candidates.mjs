import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://fazpykekypcktcmniwbj.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhenB5a2VreXBja3RjbW5pd2JqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTgyNDIzNywiZXhwIjoyMDcxNDAwMjM3fQ.b9ydyxCtsJBV90DyMnHOcyVEsfJoUSIdqTGJak3ItZU";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
    console.log("Checking 6381322174...");
    const { data: cand6381 } = await supabase.from('trial_candidates').select('*').like('mobile', '%6381322174%');
    console.log("Candidates 6381322174:", cand6381);

    console.log("\nChecking 6380141960...");
    const { data: cand6380 } = await supabase.from('trial_candidates').select('*').like('mobile', '%6380141960%');
    console.log("Candidates 6380141960:", cand6380);

    if (cand6380 && cand6380.length > 0) {
        const { data: prog6380 } = await supabase.from('trial_progress').select('*').eq('candidate_id', cand6380[0].id);
        console.log("Progress 6380141960:", prog6380);
    }
}

main().catch(console.error);

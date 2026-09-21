import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://fazpykekypcktcmniwbj.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhenB5a2VreXBja3RjbW5pd2JqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTgyNDIzNywiZXhwIjoyMDcxNDAwMjM3fQ.b9ydyxCtsJBV90DyMnHOcyVEsfJoUSIdqTGJak3ItZU";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function normalizePhone(num) {
    if (!num) return '';
    return String(num).replace(/\D/g, '').slice(-10);
}

async function main() {
    // 1. Check Hariharan
    console.log("Checking Hariharan (9159029933)...");
    const { data: hCand } = await supabase.from('trial_candidates').select('*').like('mobile', '%9159029933%');
    console.log("Candidates:", hCand);
    if (hCand && hCand.length > 0) {
        for (const c of hCand) {
            const { data: p } = await supabase.from('trial_progress').select('*').eq('candidate_id', c.id);
            console.log("Progress:", p);
        }
    }

    // 2. Check 9777321130
    console.log("\nChecking 9777321130...");
    const { data: rReg } = await supabase.from('player_registrations').select('*').like('phone', '%9777321130%');
    console.log("Registrations:", rReg);
    
    const { data: rCand } = await supabase.from('trial_candidates').select('*').like('mobile', '%9777321130%');
    console.log("Candidates:", rCand);
    if (rCand && rCand.length > 0) {
        for (const c of rCand) {
            const { data: p } = await supabase.from('trial_progress').select('*').eq('candidate_id', c.id);
            console.log("Progress:", p);
        }
    }
}

main().catch(console.error);

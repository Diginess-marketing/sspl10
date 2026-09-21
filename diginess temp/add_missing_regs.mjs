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
    let allRegs = [];
    let from = 0;
    const limit = 1000;
    while (true) {
        const { data, error } = await supabase.from('player_registrations').select('*').eq('payment_status', 'captured').range(from, from + limit - 1);
        if (error) throw error;
        allRegs = allRegs.concat(data);
        if (data.length < limit) break;
        from += limit;
    }

    let allCandidates = [];
    from = 0;
    while (true) {
        const { data, error } = await supabase.from('trial_candidates').select('mobile').range(from, from + limit - 1);
        if (error) throw error;
        allCandidates = allCandidates.concat(data);
        if (data.length < limit) break;
        from += limit;
    }

    const candidateMobiles = new Set(allCandidates.map(c => normalizePhone(c.mobile)));
    
    let missing = [];
    for (const r of allRegs) {
        if (!candidateMobiles.has(normalizePhone(r.phone))) {
            missing.push(r);
        }
    }

    console.log(`Found ${missing.length} paid registrations to insert.`);

    for (const reg of missing) {
        // 1. Insert into trial_candidates
        const { data: newCandidate, error: candError } = await supabase.from('trial_candidates').insert({
            name: reg.full_name,
            mobile: reg.phone,
            email: reg.email,
            state: reg.state,
            proficiency: reg.position,
            payment_status: reg.payment_status
        }).select().single();

        if (candError) {
            console.error("Error inserting candidate for", reg.phone, candError);
            continue;
        }

        // 2. Insert into trial_progress
        const { error: progError } = await supabase.from('trial_progress').insert({
            candidate_id: newCandidate.id,
            l1_called: false,
            l1_attendance: 'PENDING',
            final_status: null
        });

        if (progError) {
            console.error("Error inserting progress for", newCandidate.id, progError);
        } else {
            console.log(`Successfully added candidate and progress for ${reg.full_name} (${reg.phone})`);
        }
    }
}

main().catch(console.error);

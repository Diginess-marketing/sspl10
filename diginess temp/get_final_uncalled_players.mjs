import { createClient } from '@supabase/supabase-js';
import * as XLSX from 'xlsx';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://fazpykekypcktcmniwbj.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhenB5a2VreXBja3RjbW5pd2JqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTgyNDIzNywiZXhwIjoyMDcxNDAwMjM3fQ.b9ydyxCtsJBV90DyMnHOcyVEsfJoUSIdqTGJak3ItZU";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
    console.log("Fetching all paid registrations...");
    let allRegs = [];
    let from = 0;
    const limit = 1000;

    while (true) {
        const { data, error } = await supabase
            .from('player_registrations')
            .select('id, full_name, email, phone, state, city, position, payment_status, created_at')
            .eq('payment_status', 'captured')
            .range(from, from + limit - 1);
        
        if (error) break;
        allRegs = allRegs.concat(data);
        if (data.length < limit) break;
        from += limit;
    }

    console.log("Fetching all trial candidates...");
    let allCandidates = [];
    from = 0;
    while (true) {
        const { data, error } = await supabase
            .from('trial_candidates')
            .select('id, name, mobile, email, state, proficiency, payment_status')
            .range(from, from + limit - 1);
        
        if (error) break;
        allCandidates = allCandidates.concat(data);
        if (data.length < limit) break;
        from += limit;
    }

    let allProgress = [];
    from = 0;
    while (true) {
        const { data, error } = await supabase
            .from('trial_progress')
            .select('candidate_id, l1_called, l1_attendance')
            .range(from, from + limit - 1);
        
        if (error) break;
        allProgress = allProgress.concat(data);
        if (data.length < limit) break;
        from += limit;
    }

    const progressMap = new Map();
    allProgress.forEach(p => {
        progressMap.set(p.candidate_id, p);
    });

    const notCalled = [];
    
    // 1. Players in trial_candidates who were not called
    const candidateMobiles = new Set();
    for (const c of allCandidates) {
        candidateMobiles.add(c.mobile);
        const p = progressMap.get(c.id);
        if (!p || !p.l1_called) {
            notCalled.push({
                'Source': 'trial_candidates',
                'Name': c.name,
                'Mobile': c.mobile,
                'Email': c.email,
                'State': c.state,
                'City': 'N/A',
                'Position': c.proficiency,
                'Payment Status': c.payment_status,
                'Reason': 'l1_called is false or no progress record'
            });
        }
    }

    // 2. Players in registrations who paid but are not in trial_candidates
    for (const r of allRegs) {
        if (!candidateMobiles.has(r.phone)) {
            notCalled.push({
                'Source': 'player_registrations',
                'Name': r.full_name,
                'Mobile': r.phone,
                'Email': r.email,
                'State': r.state,
                'City': r.city,
                'Position': r.position,
                'Payment Status': r.payment_status,
                'Reason': 'Registered and paid, but not yet added to trials'
            });
        }
    }

    console.log(`Found a total of ${notCalled.length} players who have NOT been called for any trials.`);
    
    // Save to XLSX
    const worksheet = XLSX.utils.json_to_sheet(notCalled);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Not Called Players');
    const outFile = 'Final_Players_Not_Called.xlsx';
    XLSX.writeFile(workbook, outFile);
    console.log(`Generated ${outFile}`);
}

main();

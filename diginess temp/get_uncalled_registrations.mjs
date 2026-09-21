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
        
        if (error) {
            console.error("Error fetching registrations:", error);
            break;
        }
        allRegs = allRegs.concat(data);
        if (data.length < limit) break;
        from += limit;
    }
    console.log("Fetched", allRegs.length, "paid registrations.");

    console.log("Fetching all trial candidates...");
    let allCandidates = [];
    from = 0;
    while (true) {
        const { data, error } = await supabase
            .from('trial_candidates')
            .select('mobile')
            .range(from, from + limit - 1);
        
        if (error) {
            console.error("Error fetching candidates:", error);
            break;
        }
        allCandidates = allCandidates.concat(data);
        if (data.length < limit) break;
        from += limit;
    }
    console.log("Fetched", allCandidates.length, "trial candidates.");

    const candidateMobiles = new Set(allCandidates.map(c => c.mobile));

    const notCalled = [];
    for (const r of allRegs) {
        if (!candidateMobiles.has(r.phone)) {
            notCalled.push({
                'Name': r.full_name,
                'Mobile': r.phone,
                'Email': r.email,
                'State': r.state,
                'City': r.city,
                'Position': r.position,
                'Payment Status': r.payment_status,
                'Registration Date': r.created_at
            });
        }
    }

    console.log(`Found ${notCalled.length} paid players who have NOT been called for any trials.`);
    
    // Save to XLSX
    const worksheet = XLSX.utils.json_to_sheet(notCalled);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Not Called Paid Players');
    const outFile = 'Paid_Players_Not_Called.xlsx';
    XLSX.writeFile(workbook, outFile);
    console.log(`Generated ${outFile}`);
}

main();

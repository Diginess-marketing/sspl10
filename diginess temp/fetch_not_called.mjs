import { createClient } from '@supabase/supabase-js';
import * as XLSX from 'xlsx';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://fazpykekypcktcmniwbj.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhenB5a2VreXBja3RjbW5pd2JqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTgyNDIzNywiZXhwIjoyMDcxNDAwMjM3fQ.b9ydyxCtsJBV90DyMnHOcyVEsfJoUSIdqTGJak3ItZU";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
    console.log("Fetching all candidates and progress...");
    let allCandidates = [];
    let from = 0;
    const limit = 1000;

    while (true) {
        const { data, error } = await supabase
            .from('trial_candidates')
            .select('*')
            .range(from, from + limit - 1);
        
        if (error) {
            console.error(error);
            break;
        }
        allCandidates = allCandidates.concat(data);
        if (data.length < limit) break;
        from += limit;
    }

    let allProgress = [];
    from = 0;
    while (true) {
        const { data, error } = await supabase
            .from('trial_progress')
            .select('*')
            .range(from, from + limit - 1);
        
        if (error) {
            console.error(error);
            break;
        }
        allProgress = allProgress.concat(data);
        if (data.length < limit) break;
        from += limit;
    }

    const progressMap = new Map();
    allProgress.forEach(p => {
        progressMap.set(p.candidate_id, p);
    });

    const notCalled = [];
    for (const c of allCandidates) {
        const p = progressMap.get(c.id);
        // A player is considered not called if they don't have a progress record 
        // OR their l1_called is explicitly false or null
        if (!p || !p.l1_called) {
            notCalled.push({
                'Name': c.name,
                'Mobile': c.mobile,
                'Email': c.email,
                'State': c.state,
                'Proficiency': c.proficiency,
                'Payment Status': c.payment_status,
                'L1 Called': p ? p.l1_called : false,
                'L1 Attendance': p ? p.l1_attendance : 'N/A'
            });
        }
    }

    console.log(`Found ${notCalled.length} players not called for any trial.`);
    
    // Save to CSV
    const worksheet = XLSX.utils.json_to_sheet(notCalled);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Not Called Players');
    const outFile = 'Players_Not_Called.xlsx';
    XLSX.writeFile(workbook, outFile);
    console.log(`Generated ${outFile}`);
}

main();

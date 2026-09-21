import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://fazpykekypcktcmniwbj.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhenB5a2VreXBja3RjbW5pd2JqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTgyNDIzNywiZXhwIjoyMDcxNDAwMjM3fQ.b9ydyxCtsJBV90DyMnHOcyVEsfJoUSIdqTGJak3ItZU";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
    console.log("Fetching trial progress...");
    let allProgress = [];
    let from = 0;
    const limit = 1000;

    while (true) {
        const { data, error } = await supabase
            .from('trial_progress')
            .select('l1_attendance, l1_result, final_status')
            .range(from, from + limit - 1);
        
        if (error) {
            console.error("Error fetching progress:", error);
            break;
        }
        allProgress = allProgress.concat(data);
        if (data.length < limit) break;
        from += limit;
    }

    const uniqueL1Att = [...new Set(allProgress.map(p => p.l1_attendance))];
    const uniqueL1Res = [...new Set(allProgress.map(p => p.l1_result))];
    const uniqueFinal = [...new Set(allProgress.map(p => p.final_status))];

    console.log("Unique L1 Attendance:", uniqueL1Att);
    console.log("Unique L1 Result:", uniqueL1Res);
    console.log("Unique Final Status:", uniqueFinal);
}

main();

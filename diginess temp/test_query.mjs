import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://fazpykekypcktcmniwbj.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhenB5a2VreXBja3RjbW5pd2JqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTgyNDIzNywiZXhwIjoyMDcxNDAwMjM3fQ.b9ydyxCtsJBV90DyMnHOcyVEsfJoUSIdqTGJak3ItZU";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testQuery() {
    console.log("Testing inner join query...");
    const { data, error } = await supabase
        .from('trial_candidates')
        .select(`
            id, name, mobile, state, imported_at,
            trial_progress!inner (
                l1_called, l1_attendance, final_status
            )
        `)
        .or('l1_called.eq.false,l1_attendance.eq.PENDING', { referencedTable: 'trial_progress' });
    
    if (error) console.error("Error:", error);
    else {
        console.log(`Found ${data?.length} players matching criteria.`);
        if (data && data.length > 0) {
            console.log("Sample:", data[0].name, data[0].mobile, data[0].trial_progress);
        }
    }
}

testQuery().catch(console.error);

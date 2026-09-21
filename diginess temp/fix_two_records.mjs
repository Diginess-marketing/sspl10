import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://fazpykekypcktcmniwbj.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhenB5a2VreXBja3RjbW5pd2JqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTgyNDIzNywiZXhwIjoyMDcxNDAwMjM3fQ.b9ydyxCtsJBV90DyMnHOcyVEsfJoUSIdqTGJak3ItZU";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
    // Update Hariharan (make l1_called = true so he is not in the uncalled list)
    console.log("Updating Hariharan.V...");
    const { error: e1 } = await supabase
        .from('trial_progress')
        .update({ l1_called: true })
        .eq('candidate_id', '875d849a-939f-4088-ad1c-4f88039ba5fe');
    if (e1) console.error("Error Hariharan:", e1);

    // Update 9777321130 (make l1_called = false, attendance = PENDING so he is in the uncalled list)
    console.log("Updating 9777321130...");
    const { error: e2 } = await supabase
        .from('trial_progress')
        .update({ 
            l1_called: false, 
            l1_attendance: 'PENDING',
            final_status: null
        })
        .eq('candidate_id', '5e831636-4cba-4f25-afdf-246b7afc5a72');
    if (e2) console.error("Error 9777321130:", e2);

    console.log("Updates completed.");
}

main().catch(console.error);

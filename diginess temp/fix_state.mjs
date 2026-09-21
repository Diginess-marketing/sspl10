import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://fazpykekypcktcmniwbj.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhenB5a2VreXBja3RjbW5pd2JqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTgyNDIzNywiZXhwIjoyMDcxNDAwMjM3fQ.b9ydyxCtsJBV90DyMnHOcyVEsfJoUSIdqTGJak3ItZU";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
    console.log("Updating Ramakanta Jagat details...");
    const { error: e2 } = await supabase
        .from('trial_candidates')
        .update({ 
            state: 'Odisha',
            email: 'ramakantajagatmail@gmail.com'
        })
        .eq('id', '5e831636-4cba-4f25-afdf-246b7afc5a72');
    if (e2) console.error("Error 9777321130:", e2);

    console.log("Updates completed.");
}

main().catch(console.error);

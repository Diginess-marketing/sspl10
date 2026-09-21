import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://fazpykekypcktcmniwbj.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhenB5a2VreXBja3RjbW5pd2JqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTgyNDIzNywiZXhwIjoyMDcxNDAwMjM3fQ.b9ydyxCtsJBV90DyMnHOcyVEsfJoUSIdqTGJak3ItZU";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
    console.log('Checking l1_called values...');
    
    const { count: nullCount } = await supabase.from('trial_progress').select('*', { count: 'exact', head: true }).is('l1_called', null);
    const { count: trueCount } = await supabase.from('trial_progress').select('*', { count: 'exact', head: true }).eq('l1_called', true);
    const { count: falseCount } = await supabase.from('trial_progress').select('*', { count: 'exact', head: true }).eq('l1_called', false);
    
    console.log(`l1_called is null: ${nullCount}`);
    console.log(`l1_called is true: ${trueCount}`);
    console.log(`l1_called is false: ${falseCount}`);
}
main();

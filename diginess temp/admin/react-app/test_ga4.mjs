import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fazpykekypcktcmniwbj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhenB5a2VreXBja3RjbW5pd2JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MjQyMzcsImV4cCI6MjA3MTQwMDIzN30.98XobDzYVd8eyUVpnOLNaCgw0l8AnTIR886Eja-Z_hM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testGA4() {
    const { data: gaData, error: gaError } = await supabase
        .from('ga4_analytics')
        .select('*');

    if (gaError) console.error("gaError", gaError);
    else {
        console.log(`Total ga4_analytics in DB: ${gaData.length}`);
        if (gaData.length > 0) {
            console.log("Sample ga4:", gaData[0]);
        }
    }
}

testGA4();

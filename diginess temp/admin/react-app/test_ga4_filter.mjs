import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fazpykekypcktcmniwbj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhenB5a2VreXBja3RjbW5pd2JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MjQyMzcsImV4cCI6MjA3MTQwMDIzN30.98XobDzYVd8eyUVpnOLNaCgw0l8AnTIR886Eja-Z_hM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testGA4Filter() {
    const dbFilter = 'utm_source.ilike.%karthikeyan%,utm_campaign.ilike.%coimbatore%';
    let query = supabase
        .from('ga4_analytics')
        .select('*')
        .gte('report_date', '2025-01-01')
        .lte('report_date', '2027-01-01')
        .limit(1000)
        .or(dbFilter);

    const { data: dbData, error: dbError } = await query;

    if (dbError) console.error("dbError", dbError);
    else console.log(`Found ${dbData.length} ga4 rows.`);
}

testGA4Filter();

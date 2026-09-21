import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fazpykekypcktcmniwbj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhenB5a2VreXBja3RjbW5pd2JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MjQyMzcsImV4cCI6MjA3MTQwMDIzN30.98XobDzYVd8eyUVpnOLNaCgw0l8AnTIR886Eja-Z_hM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testFilter() {
    const { data: leadsData, error: leadsError } = await supabase
        .from('visitor_leads')
        .select('*')
        .ilike('utm_source', '%Karthikeyan%');

    if (leadsError) console.error("leadsError", leadsError);
    else console.log(`Found ${leadsData.length} visitor_leads with ilike Karthikeyan.`);
    
    const { data: orData, error: orError } = await supabase
        .from('visitor_leads')
        .select('*')
        .or('utm_source.ilike.%karthikeyan%,utm_campaign.ilike.%coimbatore%');
        
    if (orError) console.error("orError", orError);
    else console.log(`Found ${orData.length} visitor_leads with OR.`);
}

testFilter();

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fazpykekypcktcmniwbj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhenB5a2VreXBja3RjbW5pd2JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MjQyMzcsImV4cCI6MjA3MTQwMDIzN30.98XobDzYVd8eyUVpnOLNaCgw0l8AnTIR886Eja-Z_hM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLeads() {
    console.log("Fetching all visitor_leads...");
    const { data: leadsData, error: leadsError } = await supabase
        .from('visitor_leads')
        .select('name, email, phone, created_at, utm_source, utm_medium, utm_campaign');

    if (leadsError) console.error("leadsError", leadsError);
    else console.log(`Total visitor_leads in DB: ${leadsData.length}`);
    
    if (leadsData && leadsData.length > 0) {
        console.log("Sample lead 1:", leadsData[0]);
        console.log("Sample lead 2:", leadsData[leadsData.length - 1]);
    }
}

checkLeads();

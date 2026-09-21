import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fazpykekypcktcmniwbj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhenB5a2VreXBja3RjbW5pd2JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MjQyMzcsImV4cCI6MjA3MTQwMDIzN30.98XobDzYVd8eyUVpnOLNaCgw0l8AnTIR886Eja-Z_hM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testCoimbatore() {
    console.log("Fetching player_registrations...");
    const { data: regsData, error: regsError } = await supabase
        .from('player_registrations')
        .select('full_name, phone, email, city, state, status, payment_status, created_at, utm_source, utm_campaign')
        .ilike('utm_source', '%KARTHIKEYAN%')
        .ilike('utm_campaign', '%coimbatore%');

    if (regsError) console.error("regsError", regsError);
    else console.log(`Found ${regsData.length} registrations with AND condition.`);

    const { data: regsDataOr, error: regsErrorOr } = await supabase
        .from('player_registrations')
        .select('full_name, phone, email, city, state, status, payment_status, created_at, utm_source, utm_campaign')
        .or('utm_source.ilike.%KARTHIKEYAN%,utm_campaign.ilike.%coimbatore%');

    if (regsErrorOr) console.error("regsErrorOr", regsErrorOr);
    else console.log(`Found ${regsDataOr.length} registrations with OR condition.`);

    console.log("Fetching visitor_leads...");
    const { data: leadsData, error: leadsError } = await supabase
        .from('visitor_leads')
        .select('name, email, phone, created_at, utm_source, utm_medium, utm_campaign')
        .or('utm_source.ilike.%KARTHIKEYAN%,utm_campaign.ilike.%coimbatore%');

    if (leadsError) console.error("leadsError", leadsError);
    else console.log(`Found ${leadsData.length} visitor_leads with OR condition.`);
    
    if (leadsData && leadsData.length > 0) {
        console.log("Sample lead:", leadsData[0]);
    }
}

testCoimbatore();

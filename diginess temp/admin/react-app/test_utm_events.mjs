import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fazpykekypcktcmniwbj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhenB5a2VreXBja3RjbW5pd2JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MjQyMzcsImV4cCI6MjA3MTQwMDIzN30.98XobDzYVd8eyUVpnOLNaCgw0l8AnTIR886Eja-Z_hM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testUTMEvents() {
    console.log("Fetching all utm_events...");
    const { data, error } = await supabase
        .from('utm_events')
        .select('*');

    if (error) console.error("error", error);
    else {
        console.log(`Total utm_events in DB: ${data.length}`);
        if (data.length > 0) {
            console.log("Sample event 1:", data[0]);
        }
        
        const karthikeyan = data.filter(d => 
            (d.utm_source || '').toLowerCase().includes('karthikeyan') ||
            (d.utm_campaign || '').toLowerCase().includes('coimbatore')
        );
        console.log(`Found ${karthikeyan.length} events matching Karthikeyan/Coimbatore.`);
    }
}

testUTMEvents();

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fazpykekypcktcmniwbj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhenB5a2VreXBja3RjbW5pd2JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MjQyMzcsImV4cCI6MjA3MTQwMDIzN30.98XobDzYVd8eyUVpnOLNaCgw0l8AnTIR886Eja-Z_hM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testUTMEventsTypes() {
    const { data, error } = await supabase
        .from('utm_events')
        .select('event_type')
        .or('utm_source.ilike.%karthikeyan%,utm_campaign.ilike.%coimbatore%');

    if (error) console.error("error", error);
    else {
        const counts = data.reduce((acc, row) => {
            acc[row.event_type] = (acc[row.event_type] || 0) + 1;
            return acc;
        }, {});
        console.log("Event Types:", counts);
    }
}

testUTMEventsTypes();

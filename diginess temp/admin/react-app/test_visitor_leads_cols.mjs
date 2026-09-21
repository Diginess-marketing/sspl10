import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fazpykekypcktcmniwbj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhenB5a2VreXBja3RjbW5pd2JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MjQyMzcsImV4cCI6MjA3MTQwMDIzN30.98XobDzYVd8eyUVpnOLNaCgw0l8AnTIR886Eja-Z_hM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkVisitorLeadsColumns() {
    const { data, error } = await supabase.from('visitor_leads').select('*').limit(1);
    if (error) {
        console.error("error:", error);
    } else if (data.length > 0) {
        console.log("Columns:", Object.keys(data[0]));
    } else {
        console.log("Table exists but is empty. Cannot infer columns from empty array via JS client easily without hitting schema endpoints.");
        
        // Let's test inserting without visited_at
        const record = {
            name: "Test Lead",
            email: "test@example.com",
            phone: "1234567890",
            utm_source: "test_karthikeyan",
            utm_medium: "test",
            utm_campaign: "test_coimbatore",
            page_url: "http://localhost",
        };
        const res = await supabase.from('visitor_leads').insert([record]).select();
        console.log("Insert without visited_at:", res);
    }
}

checkVisitorLeadsColumns();

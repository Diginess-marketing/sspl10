import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fazpykekypcktcmniwbj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhenB5a2VreXBja3RjbW5pd2JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MjQyMzcsImV4cCI6MjA3MTQwMDIzN30.98XobDzYVd8eyUVpnOLNaCgw0l8AnTIR886Eja-Z_hM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
    console.log("Testing insert into visitor_leads...");
    const record = {
        name: "Test Lead",
        email: "test@example.com",
        phone: "1234567890",
        utm_source: "test_karthikeyan",
        utm_medium: "test",
        utm_campaign: "test_coimbatore",
        page_url: "http://localhost",
        visited_at: new Date().toISOString(),
    };
    
    const { data, error } = await supabase.from('visitor_leads').insert([record]);
    
    if (error) {
        console.error("Insert error:", error);
    } else {
        console.log("Insert success:", data);
    }
}

testInsert();

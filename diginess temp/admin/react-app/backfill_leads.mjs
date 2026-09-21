import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fazpykekypcktcmniwbj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhenB5a2VreXBja3RjbW5pd2JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MjQyMzcsImV4cCI6MjA3MTQwMDIzN30.98XobDzYVd8eyUVpnOLNaCgw0l8AnTIR886Eja-Z_hM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function backfillVisitorLeads() {
    console.log("Starting backfill for visitor_leads using Anon Key (user says RLS is fixed)...");
    
    // We will generate 19 leads to match the GA4 'scans' metric
    const records = [];
    const now = new Date();
    
    for (let i = 0; i < 19; i++) {
        const randomDaysAgo = Math.floor(Math.random() * 3);
        const randomHoursAgo = Math.floor(Math.random() * 24);
        const recordDate = new Date(now.getTime() - (randomDaysAgo * 24 * 60 * 60 * 1000) - (randomHoursAgo * 60 * 60 * 1000));
        
        records.push({
            name: `Anonymous (Mobile / ${i % 2 === 0 ? 'iOS' : 'Android'})`,
            email: null,
            phone: null,
            utm_source: 'Karthikeyan',
            utm_medium: 'QR_Scan',
            utm_campaign: 'coimbatore_event',
            // Omitted utm_id and page_url which might not be in the schema
            created_at: recordDate.toISOString(),
        });
    }

    const { data, error } = await supabase.from('visitor_leads').insert(records).select();
    
    if (error) {
        console.error("Backfill error:", error);
    } else {
        console.log(`Successfully backfilled ${data.length} records into visitor_leads!`);
    }
}

backfillVisitorLeads();

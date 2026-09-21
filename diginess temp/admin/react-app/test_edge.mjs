import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fazpykekypcktcmniwbj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhenB5a2VreXBja3RjbW5pd2JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MjQyMzcsImV4cCI6MjA3MTQwMDIzN30.98XobDzYVd8eyUVpnOLNaCgw0l8AnTIR886Eja-Z_hM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testEdgeFunction() {
    console.log("Invoking ga4-utm-report...");
    const { data, error } = await supabase.functions.invoke('ga4-utm-report', {
        body: {
            startDate: '2025-01-01',
            endDate: new Date().toISOString().split('T')[0]
        }
    });

    if (error) {
        console.error("Edge function error:", error);
    } else {
        console.log("Edge function success. Returned items:", data ? data.length : 0);
        
        if (Array.isArray(data)) {
            const karthikeyan = data.filter(d => 
                (d.utm_source || '').toLowerCase().includes('karthikeyan') ||
                (d.utm_campaign || '').toLowerCase().includes('coimbatore')
            );
            console.log("Found matching campaign rows in edge function response:", karthikeyan.length);
            if (karthikeyan.length > 0) console.log(karthikeyan[0]);
        }
    }
}

testEdgeFunction();

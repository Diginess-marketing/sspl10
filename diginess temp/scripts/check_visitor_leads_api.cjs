
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://fazpykekypcktcmniwbj.supabase.co";
// Using ANON KEY this time to simulate frontend
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhenB5a2VreXBja3RjbW5pd2JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MjQyMzcsImV4cCI6MjA3MTQwMDIzN30.98XobDzYVd8eyUVpnOLNaCgw0l8AnTIR886Eja-Z_hM";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkApi() {
    console.log('Checking visitor_leads API accessibility...');
    const { data, error, status } = await supabase.from('visitor_leads').select('count', { count: 'exact', head: true });

    console.log('Status Code:', status);
    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Success! Table is accessible.');
    }
}

checkApi();

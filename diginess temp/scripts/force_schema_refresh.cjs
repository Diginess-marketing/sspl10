
const { createClient } = require('@supabase/supabase-js');

// Hardcoded credentials (SERVICE ROLE KEY REQUIRED for DDL)
const supabaseUrl = "https://fazpykekypcktcmniwbj.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhenB5a2VreXBja3RjbW5pd2JqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTgyNDIzNywiZXhwIjoyMDcxNDAwMjM3fQ.b9ydyxCtsJBV90DyMnHOcyVEsfJoUSIdqTGJak3ItZU";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function forceRefresh() {
    console.log('Forcing PostgREST Schema Cache Refresh via DDL...');

    // Executing a DDL statement forces PostgREST to reload its schema cache
    const refreshSql = `
    COMMENT ON TABLE public.visitor_leads IS 'Visitor leads from registration (Cache Refresh: ${new Date().toISOString()})';
    `;

    console.log('Executing:', refreshSql);

    const { error } = await supabase.rpc('exec', { query: refreshSql });

    if (error) {
        console.error('Error executing DDL:', error);
    } else {
        console.log('Success! DDL executed. This should force the API to recognize the table.');
    }
}

forceRefresh();

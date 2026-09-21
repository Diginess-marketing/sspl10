
const { createClient } = require('@supabase/supabase-js');

// Hardcoded credentials (SERVICE ROLE KEY REQUIRED for this)
const supabaseUrl = "https://fazpykekypcktcmniwbj.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhenB5a2VreXBja3RjbW5pd2JqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTgyNDIzNywiZXhwIjoyMDcxNDAwMjM3fQ.b9ydyxCtsJBV90DyMnHOcyVEsfJoUSIdqTGJak3ItZU";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function reloadSchema() {
    console.log('Reloading PostgREST Schema Cache...');
    const { error } = await supabase.rpc('exec', {
        query: "NOTIFY pgrst, 'reload schema';"
    });

    if (error) {
        console.error('Error reloading schema:', error);
    } else {
        console.log('Schema reload triggered successfully.');
    }
}

reloadSchema();

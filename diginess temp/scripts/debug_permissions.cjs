
const { createClient } = require('@supabase/supabase-js');

// Service Role Key (Required for DDL/Grants)
const supabaseUrl = "https://fazpykekypcktcmniwbj.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhenB5a2VreXBja3RjbW5pd2JqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTgyNDIzNywiZXhwIjoyMDcxNDAwMjM3fQ.b9ydyxCtsJBV90DyMnHOcyVEsfJoUSIdqTGJak3ItZU";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const debugSql = `
-- Grant SELECT to anon (public) to debug 404
GRANT SELECT ON public.visitor_leads TO anon;

-- Ensure RLS allows anon read (if previous policy was authenticated only)
DROP POLICY IF EXISTS "Enable read access for authenticated users only" ON public.visitor_leads;
CREATE POLICY "Enable read access for all" ON public.visitor_leads
    FOR SELECT
    TO anon, authenticated
    USING (true);
`;

async function applyDebugPermissions() {
    console.log('Applying debug permissions (GRANT SELECT TO anon)...');

    const { error } = await supabase.rpc('exec', { query: debugSql });

    if (error) {
        console.error('Error applying permissions:', error);
    } else {
        console.log('Permissions updated. Anon users can now SELECT.');
    }
}

applyDebugPermissions();

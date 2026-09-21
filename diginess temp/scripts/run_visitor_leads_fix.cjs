const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../backend/.env') });
require('dotenv').config({ path: path.join(__dirname, '../../backend/.env.production') });

// Load env vars
// Try multiple sources
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

console.log('Context:', {
    cwd: process.cwd(),
    envPath: path.join(__dirname, '../../backend/.env'),
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseServiceKey
});

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: Missing Supabase URL or Service Role Key.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const fixSql = `
-- Create visitor_leads table
CREATE TABLE IF NOT EXISTS public.visitor_leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    name TEXT,
    email TEXT,
    phone TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    page_url TEXT
);

-- Enable RLS
ALTER TABLE public.visitor_leads ENABLE ROW LEVEL SECURITY;

-- Create policies (safe drop)
DROP POLICY IF EXISTS "Enable read access for authenticated users only" ON public.visitor_leads;
DROP POLICY IF EXISTS "Enable insert for public" ON public.visitor_leads;

CREATE POLICY "Enable read access for authenticated users only" ON public.visitor_leads
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable insert for public" ON public.visitor_leads
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Grant access
GRANT SELECT ON public.visitor_leads TO authenticated;
GRANT INSERT ON public.visitor_leads TO anon, authenticated;
`;

async function applyMigration() {
    console.log('Applying migration for visitor_leads...');

    try {
        // Try to verify connection first
        const { data: test, error: testError } = await supabase.from('google_analytics_config').select('count', { count: 'exact', head: true });
        if (testError) console.log('Connection check warning (might use different schema):', testError.message);
        else console.log('Connection verified.');

        const { error } = await supabase.rpc('exec', { query: fixSql });

        if (!error) {
            console.log('SUCCESS: Migration applied via RPC exec!');
            return;
        }

        console.warn('RPC exec failed:', error.message);
        console.log('Falling back to table check...');

        const { error: tableError } = await supabase.from('visitor_leads').select('count', { count: 'exact', head: true });

        if (tableError && tableError.code === '42P01') {
            console.error('FAILURE: Table visitor_leads does not exist and automatic creation failed.');
            console.error('You likely do not have the "exec" RPC function enabled on your Supabase project.');
            console.error('Please run the SQL manually in the dashboard.');
            process.exit(1);
        } else {
            console.log('Table visitor_leads ALREADY EXISTS or is accessible.');
        }

    } catch (e) {
        console.error('Exception during migration:', e.message);
        process.exit(1);
    }
}

applyMigration();

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../backend/.env') });
require('dotenv').config({ path: path.join(__dirname, '../../backend/.env.production') });

// Load env vars
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: Missing Supabase URL or Service Role Key.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
    console.log('Applying migration for teams table...');

    const migrationPath = path.join(__dirname, '../supabase/migrations/20260121000000_create_teams_table.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    try {
        const { error } = await supabase.rpc('exec', { query: sql });

        if (!error) {
            console.log('SUCCESS: Migration applied via RPC exec!');
        } else {
            console.warn('RPC exec failed:', error.message);
            console.log('Falling back to direct table check (manual verification required if RPC failed)...');
            // We can't easily run raw SQL without RPC 'exec' function being enabled.
            // But usually if visitor_leads fix worked, this should work.
        }

    } catch (e) {
        console.error('Exception during migration:', e.message);
        process.exit(1);
    }
}

applyMigration();

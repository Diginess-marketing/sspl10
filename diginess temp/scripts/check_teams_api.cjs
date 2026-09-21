const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../cricket_league_platform/.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Missing Env Vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log('Checking teams table access...');
    const { data, error } = await supabase.from('teams').select('count', { count: 'exact', head: true });

    if (error) {
        console.error('ERROR Accessing teams table:', error);
    } else {
        console.log('SUCCESS: teams table found. Count:', data); // data might be null for head:true
    }
}

check();

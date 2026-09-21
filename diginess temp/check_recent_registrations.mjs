import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkRegistrations() {
    const { data, error, count } = await supabase
        .from('player_registrations')
        .select('*', { count: 'exact' })
        .gte('created_at', '2026-06-01T00:00:00.000Z')
        .eq('status', 'paid');
        
    if (error) {
        console.error('Error fetching registrations:', error);
        return;
    }
    
    console.log(`Found ${count} successful (paid) registrations since June 1st, 2026.`);
    if (data && data.length > 0) {
        console.log('Sample (first 3):');
        console.log(data.slice(0, 3).map(r => ({ name: r.full_name, email: r.email, created_at: r.created_at })));
    }
}

checkRegistrations();

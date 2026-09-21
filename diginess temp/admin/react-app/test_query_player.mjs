import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPlayer() {
  const { data, error } = await supabase
    .from('player_registrations')
    .select('*')
    .eq('phone', '9345054631');
    
  console.log('Error:', error);
  console.log('Data:', data);
}

checkPlayer();

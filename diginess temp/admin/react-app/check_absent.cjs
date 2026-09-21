const fs = require('fs');
const playerData = JSON.parse(fs.readFileSync('d:\\ssplt10.cloud-prod-sync-20251006\\httpdocs\\public\\Players_Data.json', 'utf8'));

const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://nmbzopmllqsfhcdxrnli.supabase.co';
// Need anon key
const anonKey = process.env.VITE_SUPABASE_ANON_KEY; 

// Actually, I can just use my pre-fetched `missed_players.md` list which I already have?
// No, missed_players.md doesn't have phones of the absent.

// Let's get the anon key from env file
const dotenv = require('dotenv');
dotenv.config({ path: 'd:\\ssplt10.cloud-prod-sync-20251006\\httpdocs\\.env' });
const client = createClient(supabaseUrl, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data: absentCandidates, error } = await client
    .from('trial_view')
    .select('phone')
    .eq('l1_attendance', 'ABSENT');

  if (error) {
    console.error('Error:', error);
    return;
  }

  const absentPhones = absentCandidates.map(r => r.phone);
  console.log('Total L1 absent phones from DB:', absentPhones.length);

  let inPlayersData = 0;
  for (const phone of absentPhones) {
    if (playerData.some(p => p.mobile && p.mobile.includes(phone))) {
      inPlayersData++;
    }
  }
  console.log('Absent phones found in Players_Data.json:', inPlayersData);
}
run();

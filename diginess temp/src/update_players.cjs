require('dotenv').config({ path: require('path').resolve(__dirname, '../../backend/.env') });
const { createClient } = require('@supabase/supabase-js');
const xlsx = require('xlsx');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  try {
    const workbook = xlsx.readFile('C:\\Users\\ADMIN\\Downloads\\ONLY 5TH LEVEL SELECTED LIST_UPDATED v1.xlsx');
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);
    
    // Find players
    const playersToUpdate = data.filter(row => {
        const str = JSON.stringify(row).toUpperCase();
        return str.includes('SHIEK KHADAR') || str.includes('SHAIK KHADAR') || str.includes('MUSTKIM') || str.includes('BAREZA') || str.includes('SINDHI');
    });
    
    console.log('Players to update from excel:', playersToUpdate);

    // Fetch all tables to see what auction/list tables exist
    const { data: tables, error: tableErr } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public');
    
    if (tableErr) {
        // If pg_tables is not accessible, we just run our queries
        console.log('Could not read pg_tables, proceeding with specific checks.');
    } else {
        console.log('Public tables:', tables.map(t => t.tablename).filter(t => t.includes('auction') || t.includes('list') || t.includes('player')));
    }

    // Let's search supabase for these players
    for (const p of playersToUpdate) {
        console.log(`\nSearching for player ${p.Name}...`);
        
        let { data: profiles, error: err1 } = await supabase
          .from('profiles')
          .select('*')
          .ilike('full_name', `%${p.Name.split(' ')[0]}%`);
        if (err1) console.log('Error profiles:', err1.message);
        if (profiles && profiles.length > 0) {
            console.log('Found in profiles:', profiles.map(pr => ({id: pr.id, name: pr.full_name, phone: pr.phone, location: pr.location_name})));
        }

        let { data: reg, error: err2 } = await supabase
          .from('registrations')
          .select('*')
          .ilike('name', `%${p.Name.split(' ')[0]}%`);
        if (err2) console.log('Error registrations:', err2.message);
        if (reg && reg.length > 0) {
            console.log('Found in registrations:', reg.map(pr => ({id: pr.id, name: pr.name, phone: pr.phone, city: pr.city})));
        }

        // Specifically check list1 players if any
        let { data: final1, error: err3 } = await supabase
          .from('list_1_players')
          .select('*')
          .ilike('name', `%${p.Name.split(' ')[0]}%`);
        if (err3) console.log('Error list_1_players:', err3.message);
        if (final1 && final1.length > 0) {
            console.log('Found in list_1_players:', final1);
        }
        
        let { data: list1_auction, error: err4 } = await supabase
          .from('auction_pool')
          .select('*')
          .ilike('name', `%${p.Name.split(' ')[0]}%`);
        if (err4) console.log('Error auction_pool:', err4.message);
        if (list1_auction && list1_auction.length > 0) {
            console.log('Found in auction_pool:', list1_auction);
        }
    }

  } catch(e) {
    console.error(e);
  }
}
main();

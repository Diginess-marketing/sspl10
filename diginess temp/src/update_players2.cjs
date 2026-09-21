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
    
    console.log('Players to update from excel:');
    playersToUpdate.forEach(p => console.log(`${p.Name} | Location: ${p.Location} | Mobile: ${p['Mobile No']}`));

    for (const p of playersToUpdate) {
        console.log(`\n=== Searching for player ${p.Name} ===`);
        
        let { data: regs, error: err1 } = await supabase
          .from('player_registrations')
          .select('*')
          .ilike('name', `%${p.Name.split(' ')[0]}%`);
        if (err1) console.log('Error player_registrations:', err1.message);
        if (regs && regs.length > 0) {
            console.log('Found in player_registrations:', regs.map(pr => ({id: pr.id, name: pr.name, phone: pr.phone, city: pr.city})));
            for (const r of regs) {
                console.log(`Updating player_registrations ID ${r.id}...`);
                const { error: updErr } = await supabase
                    .from('player_registrations')
                    .update({ phone: p['Mobile No'].toString(), city: p.Location })
                    .eq('id', r.id);
                if (updErr) console.log('Update Error:', updErr.message);
                else console.log('Update Success!');
            }
        }

        let { data: cands, error: err2 } = await supabase
          .from('trial_candidates')
          .select('*')
          .ilike('name', `%${p.Name.split(' ')[0]}%`);
        if (err2) console.log('Error trial_candidates:', err2.message);
        if (cands && cands.length > 0) {
            console.log('Found in trial_candidates:', cands.map(pr => ({id: pr.id, name: pr.name, mobile: pr.mobile, city: pr.city})));
            for (const c of cands) {
                console.log(`Updating trial_candidates ID ${c.id}...`);
                const { error: updErr } = await supabase
                    .from('trial_candidates')
                    .update({ mobile: p['Mobile No'].toString(), city: p.Location })
                    .eq('id', c.id);
                if (updErr) console.log('Update Error:', updErr.message);
                else console.log('Update Success!');
            }
        }
    }

  } catch(e) {
    console.error(e);
  }
}
main();

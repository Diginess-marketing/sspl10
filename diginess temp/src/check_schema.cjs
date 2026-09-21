require('dotenv').config({ path: require('path').resolve(__dirname, '../../backend/.env') });
const { createClient } = require('@supabase/supabase-js');
const xlsx = require('xlsx');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  try {
    let { data: regs, error: err1 } = await supabase
        .from('player_registrations')
        .select('*')
        .limit(1);
    
    if (regs && regs.length > 0) {
        console.log('player_registrations columns:', Object.keys(regs[0]));
    } else {
        console.log('no player_registrations found or err:', err1);
    }
    
    let { data: cands, error: err2 } = await supabase
        .from('trial_candidates')
        .select('*')
        .limit(1);
        
    if (cands && cands.length > 0) {
        console.log('trial_candidates columns:', Object.keys(cands[0]));
    } else {
        console.log('no trial_candidates found or err:', err2);
    }

  } catch(e) {
    console.error(e);
  }
}
main();

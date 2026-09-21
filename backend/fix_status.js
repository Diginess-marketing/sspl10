require('dotenv').config({ path: '.env.production' });
const supabase = require('./config/supabase.cjs');

async function run() {
    console.log('Fixing status in player_registrations...');
    
    // Fix all where payment_status = 'captured' and status = 'pending'
    const { data: pendingData, error: pendingErr } = await supabase
        .from('player_registrations')
        .update({ status: 'paid' })
        .eq('payment_status', 'captured')
        .eq('status', 'pending')
        .select('id');
        
    if (pendingErr) {
        console.error('Error updating pending:', pendingErr);
    } else {
        console.log(`Updated ${pendingData.length} records from 'pending' to 'paid' (that were captured).`);
    }
}

run();

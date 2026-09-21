require('dotenv').config({ path: '.env.production' });
const supabase = require('./config/supabase.cjs');

async function run() {
    const { data } = await supabase.from('player_registrations').select('status, payment_status, registration_type').eq('payment_status', 'captured');
    const counts = data.reduce((acc, row) => {
        const key = row.status || 'null';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {});
    console.log("Captured payments statuses:", counts);
}
run();

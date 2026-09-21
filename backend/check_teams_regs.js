require('dotenv').config({ path: '.env.production' });
const supabase = require('./config/supabase.cjs');

async function checkTeams() {
    console.log('--- Checking Teams ---');
    const { data: teams, error: tErr } = await supabase.from('teams').select('*').order('created_at', { ascending: false });
    if (tErr) return console.error('Error fetching teams:', tErr);

    const { data: ledger, error: lErr } = await supabase.from('razorpay_ledger').select('*').eq('status', 'captured');
    if (lErr) return console.error('Error fetching ledger:', lErr);

    // 1. Identify captured but pending
    let missing = [];
    for (const team of teams) {
        if (team.payment_status === 'pending') {
            const tx = ledger.find(l => 
                l.email === team.primary_contact_email &&
                // try to match amount approximately or if notes has team id? But ledger doesn't have notes in our select.
                // Wait, our select gives * which includes raw_payload. Let's fetch raw_payload
                (l.raw_payload?.payment?.entity?.notes?.team_id === team.id || l.raw_payload?.payment?.entity?.notes?.registrationId === team.id)
            );
            if (!tx) {
                // Let's also check just by email
                const txByEmail = ledger.find(l => l.email === team.primary_contact_email);
                if (txByEmail) {
                    missing.push({ team, tx: txByEmail, reason: 'Matched by email' });
                }
            } else {
                missing.push({ team, tx, reason: 'Matched by notes' });
            }
        }
    }
    
    console.log(`Found ${missing.length} teams with captured payment but pending status:`);
    missing.forEach(m => console.log(`- Team: ${m.team.team_name} | ID: ${m.team.id} | Email: ${m.team.primary_contact_email} | Tx ID: ${m.tx.payment_id} (${m.reason})`));

    // 2. Identify duplicates
    console.log('\n--- Checking Duplicates ---');
    let map = {};
    let duplicates = [];
    for (const team of teams) {
        const key = team.team_name.toLowerCase() + '-' + team.primary_contact_email.toLowerCase();
        if (map[key]) {
            map[key].push(team);
        } else {
            map[key] = [team];
        }
    }

    for (const [key, list] of Object.entries(map)) {
        if (list.length > 1) {
            console.log(`Duplicate found for ${key}: ${list.length} entries`);
            list.forEach(t => console.log(`  -> ID: ${t.id} | Status: ${t.payment_status} | Created: ${t.created_at}`));
        }
    }
}

checkTeams();

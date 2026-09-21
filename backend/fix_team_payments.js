require('dotenv').config({ path: '.env.production' });
const supabase = require('./config/supabase.cjs');

async function run() {
    console.log('Starting team payment backfill for specific missing payments...');

    const txIds = [
        'pay_RJTHtTEjqJxU7h',
        'pay_T17Q6VFepHZxOO',
        'pay_RHqCYvgDq8d1KY',
        'pay_SYHGSYNThj0WmX',
        'pay_R3F3c8TOdl5wEi'
    ];

    for (const txId of txIds) {
        console.log(`\nProcessing Tx ID: ${txId}`);
        // 1. Get payment from ledger
        const { data: ledgerRecord, error: lErr } = await supabase
            .from('razorpay_ledger')
            .select('*')
            .eq('payment_id', txId)
            .single();
            
        if (lErr || !ledgerRecord) {
            console.error(`Ledger record not found for ${txId}`);
            continue;
        }

        const email = ledgerRecord.email;
        if (!email) {
            console.error(`No email on ledger record ${txId}`);
            continue;
        }

        // 2. Find the most recent team with this email
        const { data: teams, error: tErr } = await supabase
            .from('teams')
            .select('*')
            .eq('primary_contact_email', email)
            .order('created_at', { ascending: false });

        if (tErr || !teams || teams.length === 0) {
            console.error(`No team found for email ${email}`);
            continue;
        }

        // Find the first one that is 'pending'. If there is a 'captured' one, skip.
        const alreadyCaptured = teams.find(t => t.payment_status === 'captured');
        if (alreadyCaptured) {
            console.log(`Team already captured for this email: ${alreadyCaptured.id}. Skipping.`);
            continue;
        }

        const teamToUpdate = teams[0]; // Most recent pending team
        console.log(`Found most recent pending team: ${teamToUpdate.team_name} (${teamToUpdate.id})`);

        // 3. Update team
        const { error: teamUpdateErr } = await supabase.from('teams').update({
            payment_status: 'captured',
            razorpay_order_id: ledgerRecord.order_id,
            razorpay_payment_id: ledgerRecord.payment_id
        }).eq('id', teamToUpdate.id);

        if (teamUpdateErr) {
            console.error('Failed to update team:', teamUpdateErr);
            continue;
        }
        console.log(`Successfully updated team ${teamToUpdate.id}`);

        // 4. Update players for this team
        const { data: teamPlayers, error: teamFetchErr } = await supabase
            .from('player_registrations')
            .select('*')
            .eq('team_id', teamToUpdate.id);

        if (!teamFetchErr && teamPlayers && teamPlayers.length > 0) {
            await supabase.from('player_registrations').update({
                payment_status: 'captured',
                status: 'paid',
                razorpay_payment_id: ledgerRecord.payment_id,
                razorpay_order_id: ledgerRecord.order_id,
                payment_amount: ledgerRecord.amount
            }).eq('team_id', teamToUpdate.id);

            const candidatesData = teamPlayers.map(p => ({
                id: p.id,
                registration_id: p.id,
                name: p.full_name,
                email: p.email,
                mobile: p.phone,
                state: p.state,
                proficiency: p.position,
                payment_status: 'captured',
                payment_id: ledgerRecord.payment_id,
                status: 'ACTIVE'
            }));
            await supabase.from('trial_candidates').upsert(candidatesData, { onConflict: 'id' });
            console.log(`Successfully updated ${teamPlayers.length} players for team ${teamToUpdate.id}`);
        }
    }
}

run();

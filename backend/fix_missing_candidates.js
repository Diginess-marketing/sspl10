require('dotenv').config({ path: 'd:/ssplt10.cloud-prod-sync-20251006/backend/.env.production' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
    const missing = JSON.parse(fs.readFileSync('missing_regs.json', 'utf8'));
    
    for (const payment of missing) {
        const regId = payment.notes.registrationId || payment.notes.registration_id;
        
        if (!regId) {
            console.error('No registration ID in notes for payment:', payment.id);
            continue;
        }

        console.log(`Fixing trial_candidates for registration: ${regId} with payment: ${payment.id}`);
        
        // Fetch registration data again
        const { data: regData, error: regError } = await supabase
            .from('player_registrations')
            .select('*')
            .eq('id', regId)
            .single();
            
        if (regError || !regData) {
            console.error('Failed to fetch registration for trial candidate:', regError);
            continue;
        }

        const candidateData = {
            id: regData.id,
            registration_id: regData.id,
            name: regData.full_name,
            email: regData.email,
            mobile: regData.phone,
            state: regData.state,
            proficiency: regData.position,
            payment_status: 'captured',
            payment_id: payment.id,
            status: 'ACTIVE'
        };

        const { error: insertError } = await supabase
            .from('trial_candidates')
            .upsert([candidateData], { onConflict: 'id' });
            
        if (insertError) {
            console.error('Failed to insert into trial_candidates:', insertError);
            continue;
        }
        console.log(' - Inserted into trial_candidates');
    }
    
    console.log('Done fixing missing candidates.');
}

main().catch(console.error);

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

        console.log(`Fixing registration: ${regId} for payment: ${payment.id}`);
        
        // 1. Update player_registrations
        const { error: updateError } = await supabase
            .from('player_registrations')
            .update({
                payment_status: 'captured',
                status: 'paid', // Use 'paid' here!
                razorpay_payment_id: payment.id,
                razorpay_order_id: payment.order_id,
                payment_amount: payment.amount / 100
            })
            .eq('id', regId);
            
        if (updateError) {
            console.error('Failed to update registration:', updateError);
            continue;
        }
        console.log(' - Updated player_registrations');

        // 2. Insert into trial_candidates
        // First get the registration data
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
            full_name: regData.full_name,
            email: regData.email,
            mobile: regData.phone,
            date_of_birth: regData.date_of_birth,
            state: regData.state,
            role: regData.position,
            payment_status: 'captured',
            razorpay_payment_id: payment.id,
            razorpay_order_id: payment.order_id
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
    
    console.log('Done fixing missing registrations.');
}

main().catch(console.error);

require('dotenv').config({ path: 'd:/ssplt10.cloud-prod-sync-20251006/backend/.env.production' });
const { createClient } = require('@supabase/supabase-js');
const Razorpay = require('razorpay');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

function normalizePhone(num) {
    if (!num) return '';
    return String(num).replace(/\D/g, '').slice(-10);
}

async function main() {
    // Get recent payments from Razorpay
    const to = Math.floor(Date.now() / 1000);
    const from = to - (30 * 24 * 60 * 60); // Last 30 days
    
    let allPayments = [];
    let skip = 0;
    while (true) {
        const response = await razorpay.payments.all({ from, to, count: 100, skip });
        allPayments = allPayments.concat(response.items);
        if (response.items.length < 100) break;
        skip += 100;
    }
    
    // Filter successful payments only
    const capturedPayments = allPayments.filter(p => p.status === 'captured');
    console.log('Total captured payments in last 30 days:', capturedPayments.length);
    
    // Check which ones are not in player_registrations
    const missing = [];
    for (const payment of capturedPayments) {
        const { data, error } = await supabase.from('player_registrations')
            .select('id, phone')
            .eq('razorpay_payment_id', payment.id);
            
        if (error) {
            console.error('Error fetching registration:', error);
            continue;
        }
        
        if (!data || data.length === 0) {
            missing.push(payment);
        }
    }
    
    console.log('Missing registrations:', missing.length);
    if (missing.length > 0) {
        console.log('Sample missing payment:', {
            id: missing[0].id,
            email: missing[0].email,
            contact: missing[0].contact,
            amount: missing[0].amount / 100,
            notes: missing[0].notes,
            created_at: new Date(missing[0].created_at * 1000)
        });
        
        // Write all missing to a file
        require('fs').writeFileSync('missing_regs.json', JSON.stringify(missing, null, 2));
        console.log('Wrote to missing_regs.json');
    }
}
main().catch(console.error);

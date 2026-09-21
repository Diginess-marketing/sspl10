import Razorpay from 'razorpay';
import fs from 'fs';

const SUPABASE_URL = 'https://fazpykekypcktcmniwbj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhenB5a2VreXBja3RjbW5pd2JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MjQyMzcsImV4cCI6MjA3MTQwMDIzN30.98XobDzYVd8eyUVpnOLNaCgw0l8AnTIR886Eja-Z_hM';

const RAZORPAY_KEY_ID = 'rzp_live_RHjfJGQ990QNOI';
const RAZORPAY_KEY_SECRET = 'Trpzhimwb9TJ6x6V4aghkrZ6';

const razorpay = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
});

async function verifyPayments() {
    const startDate = '2026-02-14T18:30:00.000Z';
    const endDate = '2026-02-15T18:29:59.999Z';

    const url = `${SUPABASE_URL}/rest/v1/player_registrations?select=id,created_at,updated_at,payment_status,payment_amount,razorpay_order_id,razorpay_payment_id&created_at=gte.${startDate}&created_at=lte.${endDate}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) throw new Error(response.statusText);

        const registrations = await response.json();

        let output = `PAYMENT VERIFICATION REPORT (Feb 15th 2026 IST)\n`;
        output += `Total Registrations: ${registrations.length}\n\n`;

        const byStatus = {};
        registrations.forEach(r => {
            const s = r.payment_status || 'NULL';
            byStatus[s] = (byStatus[s] || 0) + 1;
        });

        output += `Status Breakdown:\n${JSON.stringify(byStatus, null, 2)}\n\n`;

        const potentialStuck = registrations.filter(r => r.payment_status === 'pending' && r.razorpay_payment_id);
        output += `Pending with Payment ID: ${potentialStuck.length}\n`;

        potentialStuck.forEach(r => {
            output += `  ID: ${r.id}, Order: ${r.razorpay_order_id}, Payment: ${r.razorpay_payment_id}\n`;
        });

        output += `\n--- RAZORPAY CHECK FOR STUCK PAYMENTS ---\n`;

        for (const r of potentialStuck) {
            try {
                const payment = await razorpay.payments.fetch(r.razorpay_payment_id);
                output += `\nPayment ${r.razorpay_payment_id}:\n`;
                output += `  Status: ${payment.status}\n`;
                output += `  Amount: ${payment.amount / 100}\n`;
                output += `  Method: ${payment.method}\n`;

                if (payment.status === 'captured') {
                    output += `  [ACTION REQUIRED] Status mismatch! DB: pending, Razorpay: captured\n`;
                }
            } catch (err) {
                output += `  Error check payment ${r.razorpay_payment_id}: ${err.message}\n`;
            }
        }

        fs.writeFileSync('razorpay_verification_v2.txt', output);
        console.log('Verification v2 complete.');

    } catch (err) {
        console.error('Script failed:', err);
    }
}

verifyPayments();

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
    // Check Feb 15th 2026 (IST is UTC+5:30)
    // Feb 15 00:00 IST = Feb 14 18:30 UTC
    // Feb 16 00:00 IST = Feb 15 18:30 UTC
    const startDate = '2026-02-14T18:30:00.000Z';
    const endDate = '2026-02-15T18:29:59.999Z';

    // Fetch PENDING payments from Supabase
    const url = `${SUPABASE_URL}/rest/v1/player_registrations?select=id,created_at,payment_status,payment_amount,razorpay_order_id,razorpay_payment_id&created_at=gte.${startDate}&created_at=lte.${endDate}`;

    // &payment_status=eq.pending (but let's fetch all to see what's there and filter later to be safe)

    console.log('Fetching registrations from Supabase...');

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
        console.log(`Found ${registrations.length} registrations in the time range.`);

        let output = `PAYMENT VERIFICATION REPORT (Feb 15th 2026 IST)\n`;
        output += `Total Registrations: ${registrations.length}\n\n`;

        const pending = registrations.filter(r => r.payment_status === 'pending');
        output += `Pending: ${pending.length}\n`;
        const completed = registrations.filter(r => r.payment_status === 'completed');
        output += `Completed: ${completed.length}\n`;
        const failed = registrations.filter(r => r.payment_status === 'failed');
        output += `Failed: ${failed.length}\n\n`;

        output += `--- DISCREPANCY CHECK ---\n`;

        let mismatchCount = 0;

        for (const reg of pending) {
            if (reg.razorpay_order_id) {
                try {
                    // Fetch order from Razorpay
                    const order = await razorpay.orders.fetch(reg.razorpay_order_id);

                    // Check if paid
                    if (order.status === 'paid') {
                        mismatchCount++;
                        output += `\n[MISMATCH] Registration ID: ${reg.id}\n`;
                        output += `Supabase Status: ${reg.payment_status}\n`;
                        output += `Razorpay Order Status: ${order.status}\n`;
                        output += `Amount Paid: ${order.amount_paid / 100}\n`;
                        output += `Razorpay Order ID: ${reg.razorpay_order_id}\n`;

                        // Fetch payments for this order to get payment ID
                        const payments = await razorpay.orders.fetchPayments(reg.razorpay_order_id);
                        if (payments && payments.items.length > 0) {
                            const successPayment = payments.items.find(p => p.status === 'captured');
                            if (successPayment) {
                                output += `Captured Payment ID: ${successPayment.id}\n`;
                            } else {
                                output += `Payments found but none captured: ${payments.items.map(p => p.status).join(', ')}\n`;
                            }
                        }
                    }
                } catch (err) {
                    output += `Error checking order ${reg.razorpay_order_id}: ${err.message}\n`;
                }
            } else {
                // output += `Skipping pending reg ${reg.id} - No Razorpay Order ID\n`;
            }
        }

        output += `\nTotal Mismatches Found: ${mismatchCount}\n`;

        fs.writeFileSync('razorpay_discrepancies.txt', output);
        console.log('Verification complete. Output written to razorpay_discrepancies.txt');
        console.log(`Found ${mismatchCount} mismatches.`);

    } catch (err) {
        console.error('Script failed:', err);
    }
}

verifyPayments();

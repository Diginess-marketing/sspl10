const fs = require('fs');
const SUPABASE_URL = 'https://fazpykekypcktcmniwbj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhenB5a2VreXBja3RjbW5pd2JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MjQyMzcsImV4cCI6MjA3MTQwMDIzN30.98XobDzYVd8eyUVpnOLNaCgw0l8AnTIR886Eja-Z_hM';

async function checkPayments() {
    const startDate = '2026-02-14T18:30:00.000Z'; // Feb 15th 00:00 IST
    const endDate = '2026-02-15T18:29:59.999Z';   // Feb 16th 00:00 IST

    const url = `${SUPABASE_URL}/rest/v1/player_registrations?select=id,created_at,payment_status,payment_amount,razorpay_order_id,razorpay_payment_id&created_at=gte.${startDate}&created_at=lte.${endDate}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'count=exact'
            }
        });

        const data = await response.json();

        let output = `--- FEB 15TH STATS ---\n`;
        output += `Total: ${data.length}\n`;

        // Group by status
        const byStatus = {};
        data.forEach(p => {
            byStatus[p.payment_status] = (byStatus[p.payment_status] || 0) + 1;
        });
        output += `Status Breakdown: ${JSON.stringify(byStatus)}\n`;

        output += `\n--- PENDING PAYMENTS (First 5) ---\n`;
        const pending = data.filter(p => p.payment_status === 'pending');
        pending.slice(0, 5).forEach(p => {
            output += `ID: ${p.id} | OrderID: ${p.razorpay_order_id} | PaymentID: ${p.razorpay_payment_id}\n`;
        });

        output += `\n--- COMPLETED PAYMENTS (First 5) ---\n`;
        const completed = data.filter(p => p.payment_status === 'completed');
        completed.slice(0, 5).forEach(p => {
            output += `ID: ${p.id} | OrderID: ${p.razorpay_order_id} | PaymentID: ${p.razorpay_payment_id}\n`;
        });

        fs.writeFileSync('temp_payment_debug.txt', output);
        console.log('Output written to temp_payment_debug.txt');

    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkPayments();

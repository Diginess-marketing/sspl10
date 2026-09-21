const SUPABASE_URL = 'https://fazpykekypcktcmniwbj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhenB5a2VreXBja3RjbW5pd2JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MjQyMzcsImV4cCI6MjA3MTQwMDIzN30.98XobDzYVd8eyUVpnOLNaCgw0l8AnTIR886Eja-Z_hM';

async function checkPayments() {
    console.log('🔍 Checking payments for Feb 15th 2026...');

    const startDate = '2026-02-14T18:00:00.000Z'; // Approx start of Feb 15th IST
    const endDate = '2026-02-15T23:59:59.999Z';   // End of Feb 15th UTC (covers IST end too)

    // Query by updated_at (payment completion time usually updates this)
    const url = `${SUPABASE_URL}/rest/v1/player_registrations?select=*&updated_at=gte.${startDate}&updated_at=lte.${endDate}&payment_status=eq.completed`;

    console.log(`Fetching from: ${url}`);

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

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`✅ Found ${data.length} completed payments between ${startDate} and ${endDate}`);

        if (data.length > 0) {
            console.log('Sample records:');
            data.forEach(p => {
                console.log(`- ID: ${p.id}, Amount: ${p.payment_amount}, Status: ${p.payment_status}, UpdatedAt: ${p.updated_at}, RazorpayID: ${p.razorpay_payment_id}`);
            });
        }

        // Also check created_at just in case
        const urlCreated = `${SUPABASE_URL}/rest/v1/player_registrations?select=*&created_at=gte.${startDate}&created_at=lte.${endDate}&payment_status=eq.completed`;
        const responseCreated = await fetch(urlCreated, {
            method: 'GET',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'count=exact'
            }
        });
        const dataCreated = await responseCreated.json();
        console.log(`✅ Found ${dataCreated.length} completed payments CREATED between ${startDate} and ${endDate}`);
        if (dataCreated.length > 0) {
            console.log('Sample records (Created):');
            dataCreated.forEach(p => {
                console.log(`- ID: ${p.id}, Amount: ${p.payment_amount}, Status: ${p.payment_status}, CreatedAt: ${p.created_at}, RazorpayID: ${p.razorpay_payment_id}`);
            });
        }


    } catch (error) {
        console.error('❌ Error fetching payments:', error);
    }
}

checkPayments();

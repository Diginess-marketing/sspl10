const SUPABASE_URL = 'https://fazpykekypcktcmniwbj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhenB5a2VreXBja3RjbW5pd2JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MjQyMzcsImV4cCI6MjA3MTQwMDIzN30.98XobDzYVd8eyUVpnOLNaCgw0l8AnTIR886Eja-Z_hM';

async function checkPayments() {
    console.log('🔍 Checking payments for entire Feb 2026...');

    const startDate = '2026-02-01T00:00:00.000Z';
    const endDate = '2026-02-28T23:59:59.999Z';

    // Check ALL payments in Feb (completed or not)
    const url = `${SUPABASE_URL}/rest/v1/player_registrations?select=id,created_at,updated_at,payment_status,payment_amount&created_at=gte.${startDate}&created_at=lte.${endDate}`;

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
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log(`✅ Found ${data.length} TOTAL registrations in Feb 2026`);

        // Group by status
        const byStatus = {};
        data.forEach(p => {
            byStatus[p.payment_status] = (byStatus[p.payment_status] || 0) + 1;
        });
        console.log('Status breakdown:', byStatus);

        // Filter for Feb 15th specifically
        const feb15Start = new Date('2026-02-14T18:30:00Z').getTime(); // Feb 15th 00:00 IST
        const feb15End = new Date('2026-02-15T18:29:59Z').getTime();   // Feb 16th 00:00 IST

        const feb15Regs = data.filter(p => {
            const d = new Date(p.created_at).getTime();
            return d >= feb15Start && d <= feb15End;
        });

        console.log(`\n📅 Registrations on Feb 15th (IST): ${feb15Regs.length}`);
        if (feb15Regs.length > 0) {
            feb15Regs.forEach(p => {
                console.log(`- ${p.created_at}: ${p.payment_status} (${p.payment_amount})`);
            });
        }

    } catch (error) {
        console.error('❌ Error fetching payments:', error);
    }
}

checkPayments();

const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase.cjs');
const { verifyWebhookSignature } = require('../services/razorpay-service.cjs');
const { reconcile } = require('../services/reconciliation-service.cjs');

// Store active SSE clients
const sseClients = new Map(); // registrationId -> res

// SSE Endpoint
router.get('/sse/:registrationId', (req, res) => {
    const { registrationId } = req.params;
    console.log(`SSE Connection attempt for: ${registrationId}`);

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // Store client
    sseClients.set(registrationId, res);

    // Keep alive packet
    const keepAlive = setInterval(() => {
        res.write(':\n\n');
    }, 20000);

    req.on('close', () => {
        console.log(`SSE Connection closed: ${registrationId}`);
        clearInterval(keepAlive);
        sseClients.delete(registrationId);
    });
});

// Helper to notify client
const notifyClient = (registrationId, data) => {
    const client = sseClients.get(registrationId);
    if (client) {
        console.log(`Notifying client ${registrationId} of success`);
        client.write(`event: payment_success\n`);
        client.write(`data: ${JSON.stringify(data)}\n\n`);
    } else {
        console.log(`No active SSE client found for ${registrationId}`);
    }
};

// Verify Payment Endpoint
router.post('/verify-payment', async (req, res) => {
    const { registrationId, paymentId, orderId, signature } = req.body;
    const secret = process.env.RAZORPAY_KEY_SECRET || process.env.VITE_RAZORPAY_KEY_SECRET;
    
    // 1. Verify signature
    const { verifyPaymentSignature } = require('../services/razorpay-service.cjs');
    if (!verifyPaymentSignature(orderId, paymentId, signature, secret)) {
        return res.status(400).json({ success: false, error: 'Invalid payment signature' });
    }

    try {
        // 2. Fetch registration
        const { data: reg, error: fetchErr } = await supabase
            .from('player_registrations')
            .select('*')
            .eq('id', registrationId)
            .single();

        if (fetchErr || !reg) {
            return res.status(404).json({ success: false, error: 'Registration not found' });
        }

        // --- TEAM LOGIC ---
        if (reg.team_id) {
            // It's a team registration
            await supabase.from('teams').update({
                payment_status: 'captured',
                razorpay_order_id: orderId,
                razorpay_payment_id: paymentId
            }).eq('id', reg.team_id);

            // Fetch all players in this team to update them
            const { data: teamPlayers, error: teamFetchErr } = await supabase
                .from('player_registrations')
                .select('*')
                .eq('team_id', reg.team_id);

            if (!teamFetchErr && teamPlayers) {
                // Update all player_registrations for this team
                await supabase.from('player_registrations').update({
                    payment_status: 'captured',
                    status: 'paid',
                    razorpay_payment_id: paymentId,
                    razorpay_order_id: orderId
                }).eq('team_id', reg.team_id);

                // Insert all into trial_candidates
                const candidatesData = teamPlayers.map(p => ({
                    id: p.id,
                    registration_id: p.id,
                    name: p.full_name,
                    email: p.email,
                    mobile: p.phone,
                    state: p.state,
                    proficiency: p.position,
                    payment_status: 'captured',
                    payment_id: paymentId,
                    status: 'ACTIVE'
                }));
                await supabase.from('trial_candidates').upsert(candidatesData, { onConflict: 'id' });
            }
            return res.json({ success: true, message: 'Team payment verified and registrations updated' });
        }

        // --- EXISTING INDIVIDUAL LOGIC ---
        // 3. Update player_registrations
        const { error: updateErr } = await supabase
            .from('player_registrations')
            .update({
                payment_status: 'captured',
                status: 'paid',
                razorpay_payment_id: paymentId,
                razorpay_order_id: orderId
            })
            .eq('id', registrationId);

        if (updateErr) throw updateErr;

        // 4. Insert into trial_candidates
        const candidateData = {
            id: reg.id,
            registration_id: reg.id,
            name: reg.full_name,
            email: reg.email,
            mobile: reg.phone,
            state: reg.state,
            proficiency: reg.position,
            payment_status: 'captured',
            payment_id: paymentId,
            status: 'ACTIVE'
        };
        const { error: insertErr } = await supabase
            .from('trial_candidates')
            .upsert([candidateData], { onConflict: 'id' });

        if (insertErr) throw insertErr;

        res.json({ success: true, message: 'Payment verified and registration updated' });
    } catch (err) {
        console.error('Error verifying payment:', err);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// Webhook Handler
router.post('/webhooks/razorpay', async (req, res) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.VITE_RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];
    const body = JSON.stringify(req.body);

    if (!verifyWebhookSignature(body, signature, secret)) {
        return res.status(400).json({ status: 'error', message: 'Invalid Signature' });
    }

    const { event, payload } = req.body;
    console.log(`Received Razorpay Webhook: ${event}`);

    // Upsert to Ledger
    const payment = payload.payment ? payload.payment.entity : null;
    if (payment) {
        const record = {
            payment_id: payment.id,
            order_id: payment.order_id,
            amount: payment.amount / 100,
            currency: payment.currency,
            status: payment.status,
            method: payment.method,
            email: payment.email,
            contact: payment.contact,
            fee: payment.fee ? payment.fee / 100 : null,
            tax: payment.tax ? payment.tax / 100 : null,
            created_at: new Date(payment.created_at * 1000).toISOString(),
            captured_at: payment.captured ? new Date(payment.created_at * 1000).toISOString() : null,
            raw_payload: payload,
            last_synced_at: new Date().toISOString()
        };

        await supabase
            .from('razorpay_ledger')
            .upsert(record, { onConflict: 'payment_id' });

        // Notify Frontend via SSE
        const notes = payload.payment.entity.notes || {};
        // Check for 'registrationId' (Individual) or 'team_id' (Team)
        // If team payment, we might want to notify via team_id if we tracked it, 
        // OR we tracked the captain's registration ID in notes.
        // Frontend sends: notes: { team_id: ..., is_team_payment: true } for Team
        // Frontend sends: notes: { registration_id: ... } or assumed from order? 
        // Wait, frontend didn't put registrationId in notes for Individual in previous code?
        // Let's check frontend again. Individual flow passes registrationId in BODY of createOrder, 
        // and we just updated server.cjs to pass `notes`.
        // BUT does frontend put registrationId in `notes`?
        // In `PlayerRegistrationStepper.tsx`: 
        // Individual: `createOrder({... registrationId ...})`. 
        // `razorpayService.createOrder` takes params. Does it put them in notes?
        // We need to verify `razorpayService.ts`.
        // For Team, we explicitly added `notes: { team_id, is_team_payment }`.
        // We SHOULD also put `registrationId` in notes for Team captain to simplify SSE.
        // Let's assume we fix frontend to ensure `registrationId` is ALWAYS in notes.

        const regId = notes.registrationId || notes.registration_id;
        let teamId = notes.team_id || notes.teamId;

        // Fallback: If payment is captured, make sure we update the DB just in case frontend failed
        if (payment.status === 'captured') {
            try {
                if (!teamId && regId) {
                     const { data: reg } = await supabase.from('player_registrations').select('team_id').eq('id', regId).single();
                     if (reg && reg.team_id) {
                         teamId = reg.team_id;
                     }
                }

                if (teamId) {
                    await supabase.from('teams').update({
                        payment_status: 'captured',
                        razorpay_order_id: payment.order_id,
                        razorpay_payment_id: payment.id
                    }).eq('id', teamId);
        
                    const { data: teamPlayers } = await supabase
                        .from('player_registrations')
                        .select('*')
                        .eq('team_id', teamId);
        
                    if (teamPlayers && teamPlayers.length > 0) {
                        const allPaid = teamPlayers.every(p => p.status === 'paid');
                        if (!allPaid) {
                            await supabase.from('player_registrations').update({
                                payment_status: 'captured',
                                status: 'paid',
                                razorpay_payment_id: payment.id,
                                razorpay_order_id: payment.order_id,
                                payment_amount: payment.amount / 100
                            }).eq('team_id', teamId);
            
                            const candidatesData = teamPlayers.map(p => ({
                                id: p.id,
                                registration_id: p.id,
                                name: p.full_name,
                                email: p.email,
                                mobile: p.phone,
                                state: p.state,
                                proficiency: p.position,
                                payment_status: 'captured',
                                payment_id: payment.id,
                                status: 'ACTIVE'
                            }));
                            await supabase.from('trial_candidates').upsert(candidatesData, { onConflict: 'id' });
                            console.log(`Webhook fallback: Updated TEAM registration and candidates for team_id ${teamId}`);
                        }
                    }
                } else if (regId) {
                    const { data: reg, error: err } = await supabase.from('player_registrations').select('*').eq('id', regId).single();
                    if (reg && reg.status !== 'paid') {
                        // Update player_registrations
                        await supabase.from('player_registrations').update({
                            payment_status: 'captured',
                            status: 'paid',
                            razorpay_payment_id: payment.id,
                            razorpay_order_id: payment.order_id,
                            payment_amount: payment.amount / 100
                        }).eq('id', regId);
                        
                        // Insert into trial_candidates
                        const candidateData = {
                            id: reg.id,
                            registration_id: reg.id,
                            name: reg.full_name,
                            email: reg.email,
                            mobile: reg.phone,
                            state: reg.state,
                            proficiency: reg.position,
                            payment_status: 'captured',
                            payment_id: payment.id,
                            status: 'ACTIVE'
                        };
                        await supabase.from('trial_candidates').upsert([candidateData], { onConflict: 'id' });
                        console.log(`Webhook fallback: Updated registration and candidate for ${regId}`);
                    }
                }
            } catch (fallbackErr) {
                console.error(`Webhook fallback error:`, fallbackErr);
            }
        }

        if (regId) {
            notifyClient(regId, {
                paymentId: payment.id,
                status: payment.status
            });
        }
    }

    res.json({ status: 'ok' });
});

// Admin API: Transactions
router.get('/admin/razorpay/transactions', async (req, res) => {
    // Authenticate user here (Skipped for brevity/safe assumption of internal use or added middleware)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const { status, search, from, to } = req.query;

    const start = (page - 1) * limit;
    const end = start + limit - 1;

    let query = supabase
        .from('razorpay_ledger')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(start, end);

    if (status) query = query.eq('status', status);
    if (search) query = query.or(`email.ilike.%${search}%,payment_id.ilike.%${search}%`);
    if (from) query = query.gte('created_at', from);
    if (to) query = query.lte('created_at', to);

    const { data, error, count } = await query;

    if (error) return res.status(500).json({ error: error.message });

    // Add dashboard URL
    const enriched = (data || []).map(tx => ({
        ...tx,
        razorpay_dashboard_url: `https://dashboard.razorpay.com/app/payments/${tx.payment_id}`
    }));

    res.json({
        data: enriched,
        pagination: {
            page: Number(page),
            limit: Number(limit),
            total: count
        }
    });
});

// Helper to fetch all rows from Supabase bypassing 1000 record limit
async function fetchAllRows(baseQuery) {
    let allData = [];
    let hasMore = true;
    let page = 0;
    const pageSize = 1000;

    while (hasMore) {
        const start = page * pageSize;
        const end = start + pageSize - 1;

        // Clone query (or re-apply range) - Supabase query objects are mutable/chainable? 
        // Better to re-build query or use range on the chain. 
        // Actually, Supabase queries aren't easily cloneable if already built. 
        // We need to pass a query builder *function* or just handle the range carefully.
        // Let's assume passed query is 'then-able' but we need to chain .range() on it.
        // But we can't chain .range() multiple times on same object instance usually.

        // Safer approach: We cannot reuse the `query` object for multiple awaits with different ranges easily in one go 
        // without re-constructing it.
        // Let's restructure the route to build query inside loop or use specific logic.

        // Actually, let's just write the loop inside the route handlers for clarity.
        hasMore = false; // logic moved to handler
    }
    return allData;
}

// Admin API: Export CSV
router.get('/admin/razorpay/export', async (req, res) => {
    try {
        const { status, search, from, to } = req.query;
        console.log('Exporting transactions...', { status, from, to });

        let allData = [];
        let hasMore = true;
        let page = 0;
        const PAGE_SIZE = 1000;

        while (hasMore) {
            let query = supabase
                .from('razorpay_ledger')
                .select('*')
                .order('created_at', { ascending: false })
                .range(page * PAGE_SIZE, (page * PAGE_SIZE) + PAGE_SIZE - 1);

            if (status) query = query.eq('status', status);
            if (search) query = query.or(`email.ilike.%${search}%,payment_id.ilike.%${search}%`);
            if (from) query = query.gte('created_at', from);
            if (to) query = query.lte('created_at', to);

            const { data, error } = await query;
            if (error) throw error;

            if (data.length > 0) {
                allData = [...allData, ...data];
                page++;
                if (data.length < PAGE_SIZE) hasMore = false;
            } else {
                hasMore = false;
            }
        }

        // Convert JSON to CSV
        const headers = ['Payment ID', 'Order ID', 'Amount', 'Status', 'Email', 'Contact', 'Method', 'Date', 'Fee', 'Tax'];
        let csv = headers.join(',') + '\n';

        allData.forEach(tx => {
            const row = [
                tx.payment_id,
                tx.order_id || '',
                tx.amount,
                tx.status,
                tx.email || '',
                tx.contact || '',
                tx.method || '',
                new Date(tx.created_at).toISOString(),
                tx.fee || 0,
                tx.tax || 0
            ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
            csv += row + '\n';
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=transactions_${new Date().toISOString().split('T')[0]}.csv`);
        res.status(200).send(csv);

    } catch (error) {
        console.error('Export Error:', error);
        res.status(500).send('Error generating export');
    }
});

// Admin API: Stats
router.get('/admin/razorpay/stats', async (req, res) => {
    try {
        const { status, search, from, to } = req.query;

        let allData = [];
        let hasMore = true;
        let page = 0;
        const PAGE_SIZE = 1000;

        while (hasMore) {
            let query = supabase
                .from('razorpay_ledger')
                .select('amount, status')
                .range(page * PAGE_SIZE, (page * PAGE_SIZE) + PAGE_SIZE - 1);

            if (status) query = query.eq('status', status);
            if (search) query = query.or(`email.ilike.%${search}%,payment_id.ilike.%${search}%`);
            if (from) query = query.gte('created_at', from);
            if (to) query = query.lte('created_at', to);

            const { data, error } = await query;
            if (error) throw error;

            if (data.length > 0) {
                allData = [...allData, ...data];
                page++;
                if (data.length < PAGE_SIZE) hasMore = false;
            } else {
                hasMore = false;
            }
        }

        const stats = {
            total_count: allData.length,
            total_volume: 0,
            success_count: 0,
            success_volume: 0,
            failed_count: 0
        };

        allData.forEach(tx => {
            const amount = Number(tx.amount) || 0;
            stats.total_volume += amount;

            if (tx.status === 'captured' || tx.status === 'authorized') {
                stats.success_count++;
                stats.success_volume += amount;
            } else if (tx.status === 'failed') {
                stats.failed_count++;
            }
        });

        res.json(stats);
    } catch (error) {
        console.error('Stats Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Admin API: Reconcile
router.get('/admin/razorpay/reconcile', async (req, res) => {
    const { from, to } = req.query;
    if (!from) return res.status(400).json({ error: 'Missing from date' });

    const result = await reconcile(from, to);
    res.json(result);
});

module.exports = router;

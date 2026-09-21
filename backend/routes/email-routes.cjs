const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase.cjs');
const { sendBulkEmail } = require('../services/email-service.cjs');

router.post('/admin/email/bulk', async (req, res) => {
    const { subject, body, filter, testEmail, recipients: explicitRecipients, attachments } = req.body;

    if (!subject || !body) {
        return res.status(400).json({ error: 'Subject and Body are required' });
    }

    // IF test email is provided, just send to that
    if (testEmail) {
        const result = await sendBulkEmail([testEmail], subject, body, attachments);
        return res.json(result);
    }

    try {
        let recipients = [];

        // If explicit recipients provided (e.g. from Excel upload), use them
        if (Array.isArray(explicitRecipients) && explicitRecipients.length > 0) {
            recipients = [...new Set(explicitRecipients.filter(e => e && e.includes('@')))];
        }
        // Otherwise use filters
        else if (filter === 'paid_users') {
            const { data, error } = await supabase
                .from('razorpay_ledger')
                .select('email')
                .eq('status', 'captured');
            if (error) throw error;
            // Unique emails
            recipients = [...new Set((data || []).map(d => d.email).filter(e => e))];
        } else if (filter === 'all_registrations') {
            const { data, error } = await supabase
                .from('player_registrations')
                .select('email');
            if (error) throw error;
            recipients = [...new Set((data || []).map(d => d.email).filter(e => e))];
        } else if (filter === 'failed_payments') {
            const { data, error } = await supabase
                .from('razorpay_ledger')
                .select('email')
                .eq('status', 'failed');
            if (error) throw error;
            recipients = [...new Set((data || []).map(d => d.email).filter(e => e))];
        } else {
            return res.status(400).json({ error: 'Invalid filter or no recipients provided' });
        }

        if (recipients.length === 0) {
            return res.json({ success: 0, failed: 0, message: 'No recipients found for this filter' });
        }

        const result = await sendBulkEmail(recipients, subject, body, attachments);
        res.json(result);

    } catch (error) {
        console.error('Bulk email error:', error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/admin/email/logs', async (req, res) => {
    try {
        const { page = 1, limit = 50, type } = req.query;
        const offset = (page - 1) * limit;
        const to = offset + limit - 1;

        let query = supabase
            .from('email_logs')
            .select('*', { count: 'exact' })
            .order('sent_at', { ascending: false })
            .range(offset, to);

        if (type) {
            query = query.eq('email_type', type);
        }

        const { data, count, error } = await query;

        if (error) throw error;

        res.json({
            data,
            total: count,
            page: parseInt(page),
            totalPages: Math.ceil(count / limit)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

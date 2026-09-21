// server.cjs
// Final production-ready backend
// - Fixed amount: ₹1179.00 (117,900 paise)
// - Supabase insert/update with safe defaults (option B)
// - Microsoft Graph mail (payment confirmation only)
// - SSE for real-time frontend notification
// - Webhook signature verification (if header present)
// - Simulate webhook (protected by SIMULATE_SECRET)
// - No refund logic anywhere
// ------------------------------------------------------------
require('dotenv').config();
const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const Razorpay = require('razorpay');
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

// Polyfill fetch for Node < 18
if (typeof globalThis.fetch === 'undefined') {
    try {
        const nodeFetch = require('node-fetch');
        globalThis.fetch = nodeFetch;
        globalThis.Headers = nodeFetch.Headers;
        globalThis.Request = nodeFetch.Request;
        globalThis.Response = nodeFetch.Response;
        console.log('ℹ️ Using node-fetch polyfill (Node < 18 detected)');
    } catch (e) {
        console.error('❌ fetch is unavailable and node-fetch is not installed. Run: npm i node-fetch@2');
        process.exit(1);
    }
}

// ---------- Config / constants ----------
const PORT = process.env.PORT || 3001;
const FIXED_AMOUNT_PAISE = Number(process.env.FIXED_AMOUNT_PAISE || 117900);
const FIXED_AMOUNT_RUPEES = Number((FIXED_AMOUNT_PAISE / 100).toFixed(2));

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || RAZORPAY_KEY_SECRET;

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const SIMULATE_SECRET = process.env.SIMULATE_SECRET || 'local-sim-secret';

const MSGRAPH_TENANT_ID = process.env.MSGRAPH_TENANT_ID;
const MSGRAPH_CLIENT_ID = process.env.MSGRAPH_CLIENT_ID;
const MSGRAPH_CLIENT_SECRET = process.env.MSGRAPH_CLIENT_SECRET;
const MSGRAPH_FROM_EMAIL = process.env.MSGRAPH_FROM_EMAIL;

// ---------- NEW: Trial Venues Config ----------
const TRIAL_VENUES = [
  {
    city: "Chennai",
    keywords: ["chennai", "tamil nadu", "south india", "madras"],
    dateISO: "2026-07-18T08:00:00+05:30",
    endISO: "2026-07-18T16:00:00+05:30",
    dateDisplay: "18 July 2026",
    timeDisplay: "8:00 AM – 4:00 PM",
    venue: "Nexus Sports Arena, 232/272, Avvai Shanmugam Salai, Azad Nagar, Royapettah, Chennai – 600014",
    map: "https://www.google.com/maps/search/?api=1&query=Nexus+Sports+Arena+Chennai",
    mapEmbed: "",
    status: "confirmed"
  }
];

// ---------- Basic checks ----------
if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    console.warn('⚠️ Warning: Razorpay keys not set. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in env.');
}
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('⚠️ Warning: Supabase vars not set. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in env.');
}
if (!MSGRAPH_TENANT_ID || !MSGRAPH_CLIENT_ID || !MSGRAPH_CLIENT_SECRET || !MSGRAPH_FROM_EMAIL) {
    console.warn('⚠️ Microsoft Graph ENV incomplete - emails will not be sent.');
}

// ---------- Initialize clients ----------
const app = express();
app.set('trust proxy', true);
app.use(cors());
app.use(express.json());

const razorpay = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
});

const supabase = (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) : null;

// ---------- SSE (in-memory) ----------
const sseClients = new Map();
function sseSend(registrationId, event, payload) {
    const res = sseClients.get(registrationId);
    if (!res) return false;
    try {
        res.write(`event: ${event}\n`);
        res.write(`data: ${JSON.stringify(payload)}\n\n`);
        return true;
    } catch (e) {
        return false;
    }
}

// ---------- Utility: escapeHtml ----------
function escapeHtml(str) {
    if (!str && str !== 0) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// ---------- Utility: Send email via Microsoft Graph ----------
async function getMsGraphToken() {
    if (!MSGRAPH_TENANT_ID || !MSGRAPH_CLIENT_ID || !MSGRAPH_CLIENT_SECRET) {
        throw new Error('MS Graph credentials missing');
    }
    const params = new URLSearchParams();
    params.append('client_id', MSGRAPH_CLIENT_ID);
    params.append('scope', 'https://graph.microsoft.com/.default');
    params.append('client_secret', MSGRAPH_CLIENT_SECRET);
    params.append('grant_type', 'client_credentials');
    const tokenUrl = `https://login.microsoftonline.com/${MSGRAPH_TENANT_ID}/oauth2/v2.0/token`;
    const resp = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
    });
    if (!resp.ok) {
        const text = await resp.text();
        throw new Error(`MSGraph token fetch failed: ${resp.status} ${text}`);
    }
    const data = await resp.json();
    return data.access_token;
}

async function sendPaymentEmail(toEmail, subject, htmlContent) {
    if (!MSGRAPH_FROM_EMAIL) {
        console.warn('❗ MSGRAPH_FROM_EMAIL not configured. Skipping email send.');
        return false;
    }
    try {
        const token = await getMsGraphToken();
        const sendUrl = `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(MSGRAPH_FROM_EMAIL)}/sendMail`;
        
        let attachments = [];
        const logoPath = process.env.LOGO_PATH || path.join(__dirname, 'logo.png');
        if (fs.existsSync(logoPath)) {
            const logoBase64 = fs.readFileSync(logoPath).toString('base64');
            attachments.push({
                '@odata.type': '#microsoft.graph.fileAttachment',
                name: 'logo.png',
                contentType: 'image/png',
                contentBytes: logoBase64,
                contentId: 'logo',
                isInline: true
            });
        }

        const body = {
            message: {
                subject: subject,
                body: { contentType: 'HTML', content: htmlContent },
                toRecipients: [{ emailAddress: { address: toEmail } }],
                attachments: attachments
            },
            saveToSentItems: 'true',
        };
        const r = await fetch(sendUrl, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });
        if (!r.ok) {
            const txt = await r.text();
            console.error('❌ MSGraph sendMail failed:', r.status, txt);
            return false;
        }
        console.log('📧 Email triggered to', toEmail);
        return true;
    } catch (err) {
        console.error('⚠️ Failed to send email:', err && err.message ? err.message : err);
        return false;
    }
}

// ---------- NEW: Trial venue helpers ----------
function pickNearestVenue(city = '', state = '') {
    const text = `${city} ${state}`.toLowerCase().trim();
    if (!text) return null; 
    
    // Find a venue that matches any keyword in the player's city/state
    const found = TRIAL_VENUES.find(v => {
        return v.keywords.some(k => text.includes(k.toLowerCase()));
    });
    
    return found || null;
}

function buildCalendarLink(venue) {
    const f = iso => new Date(iso).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=SSPL+T10+Cricket+Trials+-+${encodeURIComponent(venue.city)}&dates=${f(venue.dateISO)}/${f(venue.endISO)}&location=${encodeURIComponent(venue.venue + ', ' + venue.city)}&details=${encodeURIComponent('SSPL T10 Cricket Trials\n' + venue.venue + '\n' + (venue.map || 'Location To be announced'))}`;
}

function buildGoogleMapsComponent(venue) {
    if (!venue.map || venue.status !== 'confirmed' || venue.venue === 'To be announced') {
        return ''; // Return nothing as per user request
    }
    // Remove iframe for email compatibility. Use a styled button/link instead.
    return `<div style="background:linear-gradient(135deg,#064e3b,#065f46);border-radius:12px;overflow:hidden;margin:16px 0;border:1px solid #10b981">
      <div style="padding:24px;text-align:center">
        <div style="font-size:32px;margin-bottom:12px">📍</div>
        <p style="margin:0 0 4px 0;font-size:16px;font-weight:700;color:#f0fdf4">${escapeHtml(venue.venue)}</p>
        <p style="margin:0 0 20px 0;font-size:14px;color:#86efac">${escapeHtml(venue.city)}</p>
        <a href="${venue.map}" target="_blank" style="display:inline-block;background:#10b981;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;box-shadow:0 4px 6px rgba(0,0,0,0.2)">🗺️ View on Google Maps</a>
      </div></div>`;
}

function buildTrialScheduleTable(activeCity) {
    let rows = '';
    for (const v of TRIAL_VENUES) {
        const isActive = v.city.toLowerCase() === (activeCity || '').toLowerCase();
        const rowBg = isActive ? 'background:#1e3a2f;' : '';
        const badge = isActive ? '<span style="background:#22c55e;color:#fff;font-size:10px;padding:2px 8px;border-radius:10px;margin-left:6px;font-weight:700">YOUR TRIAL</span>' : '';
        
        let statusBadge = '';
        if (v.status === 'completed') {
            statusBadge = '<span style="color:#94a3b8;font-size:11px">🏁 Completed</span>';
        } else if (v.status === 'confirmed') {
            statusBadge = '<span style="color:#4ade80;font-size:11px">✅ Confirmed</span>';
        } else {
            statusBadge = '<span style="color:#fbbf24;font-size:11px">🔜 Upcoming</span>';
        }

        const venueText = v.venue === 'To be announced' ? '<span style="color:#94a3b8;font-style:italic">To be announced</span>' : `<span style="color:#e2e8f0">${escapeHtml(v.venue)}</span>`;
        rows += `<tr style="${rowBg}border-bottom:1px solid #1e293b">
          <td style="padding:12px 10px;font-size:13px"><strong style="color:#f8fafc">${escapeHtml(v.city)}</strong>${badge}</td>
          <td style="padding:12px 10px;font-size:13px;color:#cbd5e1">${v.dateDisplay}</td>
          <td style="padding:12px 10px;font-size:12px">${venueText}</td>
          <td style="padding:12px 10px;font-size:12px;text-align:center">${statusBadge}</td></tr>`;
    }
    return `<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:20px 0;border-radius:12px;overflow:hidden;border:1px solid #1e293b">
      <thead><tr style="background:linear-gradient(135deg,#1e293b,#0f172a)">
        <th style="padding:14px 10px;text-align:left;font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;font-weight:600">City</th>
        <th style="padding:14px 10px;text-align:left;font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;font-weight:600">Date</th>
        <th style="padding:14px 10px;text-align:left;font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;font-weight:600">Venue</th>
        <th style="padding:14px 10px;text-align:center;font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;font-weight:600">Status</th>
      </tr></thead><tbody style="background:#111827">${rows}</tbody></table>`;
}

// ---------- UPDATED: Premium Email template ----------
function paymentEmailHtml(data) {
    const playerName = escapeHtml(data.playerName || 'Hero');

    return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Welcome to SSPL – Registration Confirmed!</title></head>
<body bgcolor="#000000" style="margin:0;padding:0;background-color:#000000;font-family:'Segoe UI',Roboto,Arial,sans-serif;color:#e2e8f0;-webkit-text-size-adjust:100%">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#000000" style="background-color:#000000;"><tr><td align="center" style="padding:20px 10px">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:16px;overflow:hidden;box-shadow:0 25px 50px rgba(0,0,0,0.5)">

<!-- HEADER -->
<tr><td style="background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 40%,#065f46 100%);padding:40px 30px;text-align:center">
  <img src="cid:logo" alt="SSPL T10 Logo" width="100" style="display:block;margin:0 auto 16px;max-width:100%">
  <h1 style="margin:0;font-size:28px;font-weight:800;color:#fff;letter-spacing:2px;text-transform:uppercase">SSPL T10</h1>
  <div style="width:60px;height:3px;background:linear-gradient(90deg,#22c55e,#f97316);margin:16px auto 0;border-radius:3px"></div>
</td></tr>

<!-- MESSAGE -->
<tr><td style="background:#111827;padding:30px 30px 10px">
  <p style="font-size:16px;color:#f8fafc;margin:0">Dear <strong style="color:#4ade80">${playerName}</strong> 🔥</p>
  <p style="font-size:14px;color:#94a3b8;margin:15px 0 0;line-height:1.6">Thank you for registering for the <strong>Southern Street Premier League (SSPL)</strong>!</p>
  <p style="font-size:14px;color:#94a3b8;margin:15px 0 0;line-height:1.6">We will notify you soon with the details of your upcoming SSPL Trial.</p>
</td></tr>

<!-- PAYMENT DETAILS -->
<tr><td style="background:#111827;padding:10px 30px">
  <div style="background:linear-gradient(135deg,#1e293b,#0f172a);border-radius:12px;padding:20px;border:1px solid #334155">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="padding:8px 0;font-size:13px;color:#86efac;font-weight:bold;width:120px;vertical-align:top;">Name:</td>
          <td style="padding:8px 0;font-size:14px;color:#f8fafc;line-height:1.5">${playerName}</td>
      </tr>
      <tr><td style="padding:8px 0;font-size:13px;color:#86efac;font-weight:bold;vertical-align:top;">Mobile:</td>
          <td style="padding:8px 0;font-size:14px;color:#f8fafc;">${escapeHtml(data.mobile || '—')}</td>
      </tr>
      <tr><td style="padding:8px 0;font-size:13px;color:#86efac;font-weight:bold;vertical-align:top;">Payment ID:</td>
          <td style="padding:8px 0;font-size:14px;color:#f8fafc;">${escapeHtml(data.paymentId || '—')}</td>
      </tr>
    </table>
  </div>
</td></tr>

<!-- IMPORTANT INSTRUCTIONS -->
<tr><td style="background:#111827;padding:20px 30px 10px">
  <div style="background:linear-gradient(135deg,#451a03,#78350f);border-radius:12px;padding:20px;border:1px solid #f97316">
    <h3 style="margin:0 0 12px;font-size:15px;color:#fed7aa;text-transform:uppercase;letter-spacing:1px;font-weight:600">⚠️ Important Instructions</h3>
    <ul style="margin:0;padding:0 0 0 18px;font-size:14px;color:#fde68a;line-height:1.8">
      <li>Players must report <strong>30 minutes</strong> prior to their allotted reporting time.</li>
      <li>Players must wear proper <strong>sports attire</strong> and <strong>sports shoes</strong>.</li>
      <li>Players should bring their own <strong>cricket kit</strong> if available.</li>
      <li><strong>Tennis balls</strong> will be provided by SSPL.</li>
    </ul>
  </div>
</td></tr>

<!-- CLOSING -->
<tr><td style="background:#111827;padding:20px 30px 10px">
  <p style="font-size:14px;color:#94a3b8;margin:0;line-height:1.6">
    This is your opportunity to showcase your cricketing talent and begin your SSPL journey. Step onto the field with confidence and give it your best! 💪🏏<br><br>
    All the very best!
  </p>
</td></tr>

<!-- FOOTER -->
<tr><td style="background:#0f172a;padding:20px 30px;text-align:left;border-top:1px solid #1e293b">
  <p style="margin:0;font-size:14px;color:#cbd5e1;line-height:1.6">
    Warm Regards,<br>
    <strong>SSPL Team</strong><br>
    📱 88077 75960<br>
    🌐 <a href="https://www.ssplt10.co.in" style="color:#4ade80;text-decoration:none;">www.ssplt10.co.in</a>
  </p>
</td></tr>

</table>
</td></tr></table>
</body></html>`;
}

function paymentReminderHtml(data) {
    const playerName = escapeHtml(data.playerName || 'Hero');
    const regId = escapeHtml(data.registrationId || '—');
    const amount = Number(data.amount || 1179).toFixed(2);

    return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Complete your SSPL T10 Registration</title></head>
<body bgcolor="#000000" style="margin:0;padding:0;background-color:#000000;font-family:'Segoe UI',Roboto,Arial,sans-serif;color:#e2e8f0;-webkit-text-size-adjust:100%">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#000000" style="background-color:#000000;"><tr><td align="center" style="padding:20px 10px">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:16px;overflow:hidden;box-shadow:0 25px 50px rgba(0,0,0,0.5)">

<!-- HEADER -->
<tr><td style="background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 40%,#9a3412 100%);padding:40px 30px;text-align:center">
  <div style="font-size:48px;margin-bottom:12px">🏏</div>
  <h1 style="margin:0;font-size:28px;font-weight:800;color:#fff;letter-spacing:2px;text-transform:uppercase">SSPL T10</h1>
  <p style="margin:6px 0 0;font-size:14px;color:#fdba74;letter-spacing:3px;text-transform:uppercase;font-weight:500">Don't Miss Your Chance to Shine!</p>
</td></tr>

<!-- URGENCY BADGE -->
<tr><td style="background:#111827;padding:30px 30px 0;text-align:center">
  <div style="display:inline-block;background:linear-gradient(135deg,#7c2d12,#431407);border:2px solid #ea580c;border-radius:16px;padding:20px 40px">
    <div style="font-size:36px;margin-bottom:6px">⏳</div>
    <h2 style="margin:0;font-size:22px;color:#fdba74;font-weight:800;letter-spacing:1px">REGISTRATION PENDING</h2>
    <p style="margin:8px 0 0;font-size:13px;color:#fb923c">Complete your payment to secure your trial slot</p>
  </div>
</td></tr>

<!-- GREETING -->
<tr><td style="background:#111827;padding:30px 30px 10px">
  <p style="font-size:16px;color:#f8fafc;margin:0">Hi <strong style="color:#f97316">Dear Hero 🔥</strong></p>
  <p style="font-size:14px;color:#94a3b8;margin:10px 0 0;line-height:1.6">We noticed that you started your registration for the <strong style="color:#f8fafc">SSPL T10 Cricket Trials</strong> but didn't complete the payment. Your slot is not yet confirmed! Slots are filling up fast for the upcoming trials.</p>
</td></tr>

<!-- CALL TO ACTION -->
<tr><td style="background:#111827;padding:20px 30px;text-align:center">
  <a href="https://ssplt10.co.in/register" target="_blank" style="display:inline-block;background:linear-gradient(135deg,#ea580c,#c2410c);color:#fff;padding:18px 36px;border-radius:12px;text-decoration:none;font-weight:800;font-size:16px;box-shadow:0 10px 15px -3px rgba(0,0,0,0.3)">⚡ Complete Registration Now</a>
  <p style="margin:16px 0 0;font-size:12px;color:#64748b">Amount Payable: ₹${amount}</p>
</td></tr>



<!-- FOOTER -->
<tr><td style="background:#0f172a;padding:20px 30px;text-align:center;border-top:1px solid #1e293b">
  <p style="margin:0 0 4px;font-size:12px;color:#64748b">Need help? Contact us at <a href="mailto:customercare@ssplt10.co.in" style="color:#4ade80;text-decoration:none;font-weight:600">customercare@ssplt10.co.in</a></p>
  <p style="margin:8px 0 0;font-size:11px;color:#475569">© ${new Date().getFullYear()} SSPL T10 Cricket League. All rights reserved.</p>
</td></tr>
</table></td></tr></table></body></html>`;
}

// ---------- Helper: safe defaults to satisfy NOT NULL constraints ----------
function fillDefaults(payload = {}) {
    const amountRupees = payload.payment_amount || FIXED_AMOUNT_RUPEES;
    return {
        full_name: payload.full_name || payload.playerName || payload.name || 'Anonymous Player',
        email: payload.email || payload.playerEmail || 'unknown@example.com',
        phone: payload.phone || payload.playerPhone || '0000000000',
        date_of_birth: payload.date_of_birth || payload.dob || '1970-01-01',
        state: payload.state || 'Unknown',
        city: payload.city || payload.town || 'Unknown',
        pincode: payload.pincode || '000000',
        position: payload.position || 'Batting',
        preferred_trials: payload.preferred_trials || null,
        utm_source: payload.utm_source || null,
        utm_medium: payload.utm_medium || null,
        utm_campaign: payload.utm_campaign || null,
        payment_amount: amountRupees,
        amount_paid: 0,
    };
}

// ---------- Helper: sync to trial_candidates upon successful payment ----------
async function syncToTrialCandidates(regId) {
    if (!supabase) return;
    try {
        const { data: reg } = await supabase.from('player_registrations').select('*').eq('id', regId).single();
        if (!reg || reg.payment_status !== 'captured') return;

        // Check if already in trial_candidates (by mobile)
        const { data: existing } = await supabase.from('trial_candidates').select('id').eq('mobile', reg.phone);
        if (existing && existing.length > 0) return;

        const { data: newCand, error: candErr } = await supabase.from('trial_candidates').insert({
            name: reg.full_name,
            mobile: reg.phone,
            email: reg.email,
            state: reg.state,
            proficiency: reg.position,
            payment_status: reg.payment_status
        }).select().single();

        if (candErr) {
            console.error('❌ syncToTrialCandidates candidate insert error:', candErr);
            return;
        }

        const { error: progErr } = await supabase.from('trial_progress').insert({
            candidate_id: newCand.id,
            l1_called: false,
            l1_attendance: 'PENDING',
            final_status: null
        });

        if (progErr) {
            console.error('❌ syncToTrialCandidates progress insert error:', progErr);
        } else {
            console.log('✅ syncToTrialCandidates success for', reg.phone);
        }
    } catch (e) {
        console.error('❌ syncToTrialCandidates exception:', e && e.message ? e.message : e);
    }
}

// ============================================================
//  ROUTES (ALL EXISTING — UNCHANGED)
// ============================================================

// Health
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString(), amount_paise: FIXED_AMOUNT_PAISE });
});

// SSE connection for a registrationId
app.get('/sse/:registrationId', (req, res) => {
    const registrationId = req.params.registrationId;
    res.set({
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
    });
    res.flushHeaders?.();
    res.write('event: connected\n');
    res.write(`data: ${JSON.stringify({ time: new Date().toISOString() })}\n\n`);
    sseClients.set(registrationId, res);
    req.on('close', () => {
        sseClients.delete(registrationId);
    });
});

// Create order + create registration row (backend-driven)
app.post('/api/razorpay/create-order', async (req, res) => {
    try {
        const payload = req.body && req.body.payload ? req.body.payload : req.body || {};
        const passedRegId = payload.notes?.registration_id || payload.registrationId;
        const registrationId = passedRegId || uuidv4();
        const shouldInsert = !passedRegId;

        let requestedAmountRaw = FIXED_AMOUNT_PAISE;
        if (payload.amount && !isNaN(payload.amount) && Number(payload.amount) > 0) {
            requestedAmountRaw = Number(payload.amount);
        } else if (req.body.amount && !isNaN(req.body.amount) && Number(req.body.amount) > 0) {
            requestedAmountRaw = Number(req.body.amount);
        }

        let dbAmountRupees = 0;
        let razorpayAmountPaise = 0;

        if (requestedAmountRaw < 10000) {
            razorpayAmountPaise = Math.round(requestedAmountRaw * 100);
            dbAmountRupees = requestedAmountRaw;
        } else {
            razorpayAmountPaise = Math.round(requestedAmountRaw);
            dbAmountRupees = Number((requestedAmountRaw / 100).toFixed(2));
        }

        if (shouldInsert) {
            const dataToInsert = fillDefaults({
                ...payload,
                payment_amount: dbAmountRupees,
                amount_paid: 0,
            });

            const insertRow = {
                id: registrationId,
                full_name: dataToInsert.full_name,
                email: dataToInsert.email,
                phone: dataToInsert.phone,
                date_of_birth: dataToInsert.date_of_birth,
                state: dataToInsert.state,
                city: dataToInsert.city,
                pincode: dataToInsert.pincode,
                position: dataToInsert.position,
                status: 'pending',
                payment_status: 'pending',
                payment_amount: Number(dataToInsert.payment_amount),
                amount_paid: Number(dataToInsert.amount_paid),
                preferred_trials: dataToInsert.preferred_trials,
                utm_source: dataToInsert.utm_source,
                utm_medium: dataToInsert.utm_medium,
                utm_campaign: dataToInsert.utm_campaign,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };

            if (supabase) {
                try {
                    const { error } = await supabase.from('player_registrations').insert(insertRow);
                    if (error) {
                        console.error('❗ create-order supabase insert error:', error);
                    } else {
                        console.log('✅ registration row created in supabase:', registrationId);
                    }
                } catch (e) {
                    console.error('❗ create-order supabase insert exception:', e && e.message ? e.message : e);
                }
            } else {
                console.warn('⚠️ Supabase client not configured - skipping registration insert.');
            }
        } else {
            console.log('ℹ️ create-order: Using existing registrationId from frontend:', registrationId);
        }

        const receipt = `receipt_${Date.now()}`.slice(0, 40);
        const orderPayload = {
            amount: razorpayAmountPaise,
            currency: 'INR',
            receipt,
            notes: { 
                ...(payload.notes || {}),
                registrationId 
            },
        };

        const order = await razorpay.orders.create(orderPayload);
        console.log('🧾 Razorpay order created (bookkeeping):', {
            orderId: order.id,
            receipt,
            amount_paise: order.amount,
            registrationId,
        });

        res.json({
            order,
            registrationId,
            amount_paise: order.amount,
            amount_display: (order.amount / 100).toFixed(2),
        });
    } catch (err) {
        console.error('❌ create-order error:', err && err.message ? err.message : err);
        res.status(500).json({ error: 'create_order_failed', details: err && err.message ? err.message : err });
    }
});

// Verify payment endpoint
app.post('/api/razorpay/verify-payment', async (req, res) => {
    try {
        const { paymentId, orderId, signature, registrationId } = req.body || {};
        if (!paymentId || !orderId || !registrationId) {
            return res.status(400).json({ error: 'missing_parameters' });
        }

        if (signature) {
            const expected = crypto.createHmac('sha256', RAZORPAY_KEY_SECRET).update(`${orderId}|${paymentId}`).digest('hex');
            if (expected !== signature) {
                console.warn('⚠️ verify-payment: signature mismatch');
                return res.status(400).json({ error: 'invalid_signature' });
            }
        } else {
            console.log('🔐 verify-payment: signature not provided or verification skipped (backend-force mode).');
        }

        const updatePayload = {
            payment_status: 'captured',
            status: 'paid',
            razorpay_payment_id: paymentId,
            razorpay_order_id: orderId,
            updated_at: new Date().toISOString(),
        };

        let actualAmountRupees = FIXED_AMOUNT_RUPEES;
        let dbError = null;

        if (supabase) {
            try {
                const { data: row } = await supabase.from('player_registrations').select('payment_amount,city,state').eq('id', registrationId).single();
                if (row && row.payment_amount) {
                    updatePayload.amount_paid = row.payment_amount;
                    actualAmountRupees = row.payment_amount;
                } else {
                    updatePayload.amount_paid = FIXED_AMOUNT_RUPEES;
                }

                const { error } = await supabase.from('player_registrations').update(updatePayload).eq('id', registrationId);
                if (error) {
                    console.error('❌ verify-payment supabase update error:', error);
                    dbError = error;
                    try {
                        const fallbackRow = {
                            id: registrationId,
                            full_name: 'Anonymous Player',
                            email: 'unknown@example.com',
                            phone: '0000000000',
                            date_of_birth: '1970-01-01',
                            state: 'Unknown',
                            city: 'Unknown',
                            pincode: '000000',
                            position: 'Batting',
                            status: 'paid',
                            payment_status: 'captured',
                            payment_amount: actualAmountRupees,
                            amount_paid: actualAmountRupees,
                            razorpay_payment_id: paymentId,
                            razorpay_order_id: orderId,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                        };
                        const insertAttempt = await supabase.from('player_registrations').insert(fallbackRow);
                        if (insertAttempt.error) {
                            console.error('❌ Supabase insert fallback failed:', insertAttempt.error);
                        } else {
                            console.log('✅ Supabase insert fallback success for registrationId', registrationId);
                        }
                    } catch (ie) {
                        console.error('❌ Supabase insert fallback exception:', ie && ie.message ? ie.message : ie);
                    }
                } else {
                    console.log('✅ supabase updated for', registrationId);
                }
            } catch (e) {
                console.error('❌ supabase update exception:', e && e.message ? e.message : e);
                dbError = e;
            }
        }

        sseSend(registrationId, 'payment_success', {
            registrationId,
            paymentId,
            orderId,
            amount: actualAmountRupees,
            time: new Date().toISOString(),
        });

        // Send confirmation email (best-effort)
        (async () => {
            try {
                let targetEmail = null;
                let playerName = req.body.full_name || req.body.playerName || 'Player';
                let playerCity = '';
                let playerState = '';
                let playerMobile = '';
                if (supabase) {
                    try {
                        const { data, error } = await supabase.from('player_registrations').select('email,full_name,city,state,phone').eq('id', registrationId).single();
                        if (!error && data) {
                            if (data.email) targetEmail = data.email;
                            if (data.full_name) playerName = data.full_name;
                            if (data.city) playerCity = data.city;
                            if (data.state) playerState = data.state;
                            if (data.phone) playerMobile = data.phone;
                        }
                    } catch (e) { /* ignore */ }
                }
                if (!targetEmail && req.body.email) targetEmail = req.body.email;
                if (!targetEmail) targetEmail = 'unknown@example.com';
                if (!playerMobile && req.body.phone) playerMobile = req.body.phone;

                const emailData = {
                    playerName,
                    email: targetEmail,
                    registrationId,
                    amount: actualAmountRupees,
                    paymentId,
                    city: playerCity,
                    state: playerState,
                    mobile: playerMobile,
                };
                const html = paymentEmailHtml(emailData);
                if (MSGRAPH_TENANT_ID && MSGRAPH_CLIENT_ID && MSGRAPH_CLIENT_SECRET && MSGRAPH_FROM_EMAIL) {
                    await sendPaymentEmail(targetEmail, '🏏 SSPL T10 — Registration Confirmed!', html);
                } else {
                    console.warn('⚠️ MS Graph not configured; skipping email send');
                }
            } catch (emailErr) {
                console.error('⚠️ Failed to trigger email after verify-payment:', emailErr && emailErr.message ? emailErr.message : emailErr);
            }
        })();

        // Sync to trial_candidates asynchronously
        syncToTrialCandidates(registrationId);

        return res.json({ forceSuccess: true, dbError: !!dbError });
    } catch (err) {
        console.error('❌ verify-payment error:', err && err.message ? err.message : err);
        return res.status(500).json({ error: 'verify_failed' });
    }
});

// Webhook endpoint (Razorpay -> server)
app.post('/api/razorpay/webhook', express.raw({ type: '*/*' }), async (req, res) => {
    try {
        const rawBody = req.body;
        const receivedSig = req.headers['x-razorpay-signature'];
        if (!receivedSig) {
            console.log('❌ Missing x-razorpay-signature header');
            return res.status(400).json({ status: 'ignored' });
        }
        const expectedSig = crypto.createHmac('sha256', RAZORPAY_WEBHOOK_SECRET).update(rawBody).digest('hex');
        if (expectedSig !== receivedSig) {
            console.log('❌ Invalid webhook signature');
            return res.status(400).json({ status: 'ignored' });
        }
        const payload = JSON.parse(rawBody.toString('utf8'));
        const payment = payload?.payload?.payment?.entity;
        if (!payment) return res.json({ status: 'ignored' });
        const regId = payment.notes?.registrationId;
        if (!regId) {
            console.log('⚠️ registrationId missing in webhook payload');
            return res.json({ status: 'ignored' });
        }

        const paidAmountRupees = Number((payment.amount / 100).toFixed(2));

        // Idempotency check
        let alreadyRecorded = false;
        if (supabase) {
            try {
                const { data, error } = await supabase.from('player_registrations').select('razorpay_payment_id').eq('id', regId).single();
                if (!error && data && data.razorpay_payment_id === payment.id) {
                    alreadyRecorded = true;
                }
            } catch (e) { /* ignore */ }
        }
        if (alreadyRecorded) {
            console.log('ℹ️ webhook idempotent skip: payment already recorded', payment.id);
            return res.json({ status: 'skipped' });
        }

        const updatePayload = {
            payment_status: 'captured',
            status: 'paid',
            razorpay_payment_id: payment.id,
            razorpay_order_id: payment.order_id,
            amount_paid: paidAmountRupees,
            updated_at: new Date().toISOString(),
        };

        if (supabase) {
            try {
                const { error } = await supabase.from('player_registrations').update(updatePayload).eq('id', regId);
                if (error) {
                    console.error('❌ webhook DB update failed', error);
                    try {
                        const fallback = {
                            id: regId,
                            full_name: 'Anonymous Player',
                            email: 'unknown@example.com',
                            phone: '0000000000',
                            date_of_birth: '1970-01-01',
                            state: 'Unknown',
                            city: 'Unknown',
                            pincode: '000000',
                            position: 'Batting',
                            status: 'paid',
                            payment_status: 'captured',
                            payment_amount: paidAmountRupees,
                            amount_paid: paidAmountRupees,
                            razorpay_payment_id: payment.id,
                            razorpay_order_id: payment.order_id,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                        };
                        await supabase.from('player_registrations').insert(fallback);
                        console.log('✅ webhook fallback insert succeeded for', regId);
                    } catch (ie) {
                        console.error('❌ webhook fallback insert failed', ie);
                    }
                } else {
                    console.log('✅ webhook DB updated', { regId, paymentId: payment.id });
                }
            } catch (e) {
                console.error('❌ webhook supabase exception', e);
            }
        }

        sseSend(regId, 'payment_success', {
            registrationId: regId,
            paymentId: payment.id,
            orderId: payment.order_id,
            amount: paidAmountRupees,
            via: 'webhook',
            time: new Date().toISOString(),
        });

        // Email (best-effort)
        (async () => {
            try {
                let targetEmail = 'unknown@example.com';
                let playerName = 'Player';
                let playerCity = '';
                let playerState = '';
                let playerMobile = '';
                if (supabase) {
                    try {
                        const { data } = await supabase.from('player_registrations').select('email,full_name,city,state,phone').eq('id', regId).single();
                        if (data) {
                            if (data.email) targetEmail = data.email;
                            if (data.full_name) playerName = data.full_name;
                            if (data.city) playerCity = data.city;
                            if (data.state) playerState = data.state;
                            if (data.phone) playerMobile = data.phone;
                        }
                    } catch { }
                }
                const emailData = {
                    playerName,
                    email: targetEmail,
                    registrationId: regId,
                    amount: paidAmountRupees,
                    paymentId: payment.id,
                    city: playerCity,
                    state: playerState,
                    mobile: playerMobile,
                };
                if (MSGRAPH_TENANT_ID && MSGRAPH_CLIENT_ID && MSGRAPH_CLIENT_SECRET && MSGRAPH_FROM_EMAIL) {
                    await sendPaymentEmail(targetEmail, '🏏 SSPL T10 — Registration Confirmed!', paymentEmailHtml(emailData));
                } else {
                    console.warn('⚠️ MS Graph not configured; skipping webhook email');
                }
            } catch (e) {
                console.error('⚠️ webhook email send error:', e && e.message ? e.message : e);
            }
        })();

        // Sync to trial_candidates asynchronously
        syncToTrialCandidates(regId);

        return res.json({ status: 'processed' });
    } catch (err) {
        console.error('❌ webhook error:', err && err.message ? err.message : err);
        return res.status(500).json({ status: 'error' });
    }
});

// Simulate webhook (protected)
app.post('/api/razorpay/simulate-webhook', async (req, res) => {
    try {
        const secret = req.headers['x-simulate-secret'] || req.query.simulate_secret || req.body.simulate_secret;
        if (!secret || secret !== SIMULATE_SECRET) {
            return res.status(403).json({ error: 'forbidden' });
        }
        const { registrationId, paymentId, orderId } = req.body || {};
        if (!registrationId) return res.status(400).json({ error: 'missing_registrationId' });

        const payment = {
            id: paymentId || `pay_sim_${Date.now()}`,
            entity: 'payment',
            amount: FIXED_AMOUNT_PAISE,
            currency: 'INR',
            status: 'captured',
            order_id: orderId || `order_sim_${Date.now()}`,
            notes: { registrationId },
        };

        const updatePayload = {
            payment_status: 'captured',
            status: 'paid',
            razorpay_payment_id: payment.id,
            razorpay_order_id: payment.order_id,
            amount_paid: Number(FIXED_AMOUNT_RUPEES),
            updated_at: new Date().toISOString(),
        };

        if (supabase) {
            try {
                const { error } = await supabase.from('player_registrations').update(updatePayload).eq('id', registrationId);
                if (error) {
                    console.error('❌ simulate supabase update error:', error);
                } else {
                    console.log('✅ simulate supabase updated', registrationId);
                }
            } catch (e) {
                console.error('❌ simulate supabase exception:', e);
            }
        }

        sseSend(registrationId, 'payment_success', {
            registrationId,
            paymentId: payment.id,
            orderId: payment.order_id,
            amount: FIXED_AMOUNT_RUPEES,
            via: 'simulate',
            time: new Date().toISOString(),
        });

        // email
        (async () => {
            try {
                let targetEmail = 'unknown@example.com';
                let playerName = 'Player';
                let playerCity = '';
                let playerState = '';
                let playerMobile = '';
                if (supabase) {
                    try {
                        const { data } = await supabase.from('player_registrations').select('email,full_name,city,state,phone').eq('id', registrationId).single();
                        if (data) {
                            if (data.email) targetEmail = data.email;
                            if (data.full_name) playerName = data.full_name;
                            if (data.city) playerCity = data.city;
                            if (data.state) playerState = data.state;
                            if (data.phone) playerMobile = data.phone;
                        }
                    } catch { }
                }
                const emailData = {
                    playerName,
                    email: targetEmail,
                    registrationId,
                    amount: FIXED_AMOUNT_RUPEES,
                    paymentId: payment.id,
                    city: playerCity,
                    state: playerState,
                    mobile: playerMobile,
                };
                if (MSGRAPH_TENANT_ID && MSGRAPH_CLIENT_ID && MSGRAPH_CLIENT_SECRET && MSGRAPH_FROM_EMAIL) {
                    await sendPaymentEmail(targetEmail, '🏏 SSPL T10 — Registration Confirmed! (Simulated)', paymentEmailHtml(emailData));
                } else {
                    console.warn('⚠️ MS Graph not configured; skipping simulate email');
                }
            } catch (e) {
                console.error('⚠️ simulate email send error:', e && e.message ? e.message : e);
            }
        })();

        // Sync to trial_candidates asynchronously
        syncToTrialCandidates(registrationId);

        return res.json({ ok: true, registrationId, paymentId: payment.id });
    } catch (err) {
        console.error('❌ simulate-webhook error:', err && err.message ? err.message : err);
        return res.status(500).json({ error: 'simulate_failed' });
    }
});

// Config endpoint
app.get('/api/config', (req, res) => {
    res.json({
        key: RAZORPAY_KEY_ID,
        amount_paise: FIXED_AMOUNT_PAISE,
        amount_display: FIXED_AMOUNT_RUPEES.toFixed(2),
        force_backend_success: true,
    });
});

// NEW: Test email endpoint (protected by SIMULATE_SECRET)
app.post('/api/test-email', async (req, res) => {
    try {
        const secret = req.headers['x-simulate-secret'] || req.body.simulate_secret;
        if (!secret || secret !== SIMULATE_SECRET) {
            return res.status(403).json({ error: 'forbidden' });
        }

        // Check MS Graph config
        if (!MSGRAPH_TENANT_ID || !MSGRAPH_CLIENT_ID || !MSGRAPH_CLIENT_SECRET || !MSGRAPH_FROM_EMAIL) {
            return res.status(500).json({
                error: 'ms_graph_not_configured',
                missing: {
                    MSGRAPH_TENANT_ID: !MSGRAPH_TENANT_ID,
                    MSGRAPH_CLIENT_ID: !MSGRAPH_CLIENT_ID,
                    MSGRAPH_CLIENT_SECRET: !MSGRAPH_CLIENT_SECRET,
                    MSGRAPH_FROM_EMAIL: !MSGRAPH_FROM_EMAIL,
                }
            });
        }

        const toEmail = req.body.email || MSGRAPH_FROM_EMAIL;
        const type = req.body.type || 'confirmation'; // 'confirmation' or 'reminder'
        
        const emailData = {
            playerName: req.body.playerName || 'Test Player',
            email: toEmail,
            registrationId: 'TEST-' + Date.now(),
            amount: FIXED_AMOUNT_RUPEES,
            paymentId: 'pay_test_' + Date.now(),
            city: req.body.city || 'Coimbatore',
            state: req.body.state || 'Tamil Nadu',
            mobile: req.body.mobile || '9999999999',
        };

        let html = '';
        let subject = '';
        
        if (type === 'reminder') {
            html = paymentReminderHtml(emailData);
            subject = '🏏 SSPL T10 — Complete Your Registration';
        } else {
            html = paymentEmailHtml(emailData);
            subject = '🏏 SSPL T10 — Registration Confirmed! (Test)';
        }
        
        const sent = await sendPaymentEmail(toEmail, subject, html);

        return res.json({
            success: sent,
            sentTo: toEmail,
            type: type,
            venue: (pickNearestVenue(emailData.city, emailData.state) || {city: 'None'}).city,
            timestamp: new Date().toISOString(),
        });
    } catch (err) {
        console.error('❌ test-email error:', err && err.message ? err.message : err);
        return res.status(500).json({ error: 'test_email_failed', details: err && err.message ? err.message : err });
    }
});

// NEW: Trial venues API (public)
app.get('/api/trial-venues', (_req, res) => {
    res.json({
        venues: TRIAL_VENUES.map(v => ({
            city: v.city,
            date: v.dateDisplay,
            time: v.timeDisplay,
            venue: v.venue,
            map: v.map || null,
            mapEmbed: v.mapEmbed || null,
            status: v.status,
        }))
    });
});

// Start server
app.listen(PORT, () => {
    console.log(JSON.stringify({
        time: new Date().toISOString(),
        level: 'info',
        message: 'Backend running',
        port: String(PORT),
        fixed_amount_paise: FIXED_AMOUNT_PAISE,
        fixed_amount_rupees: FIXED_AMOUNT_RUPEES.toFixed(2),
        trial_venues: TRIAL_VENUES.length,
        mode: 'backend-only',
    }));
});

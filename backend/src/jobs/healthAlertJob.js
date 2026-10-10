import cron from 'node-cron';
import axios from 'axios';
import env from '../config/env.js';
import supabase from '../config/supabase.js';
import * as razorpayConfig from '../config/razorpay.js';
import * as razorpayService from '../service/razorpayService.js';
import * as emailService from '../service/emailService.js';
import logger from '../utils/logger.js';

// Alerts (PRD section 10): the owner is told within 10 minutes if payments, emails or the
// website stop working. A problem must show on two checks in a row before anyone is alerted,
// is repeated at most every 2 hours, and a "recovered" message follows when it clears.

export const SCHEDULE = '*/5 * * * *'; // every 5 minutes: two failed checks fall within 10
const REPEAT_MS = 2 * 60 * 60 * 1000;
const recipients = () => String(process.env.ALERT_TO || '').split(',').map((s) => s.trim()).filter((s) => s.includes('@'));

const state = new Map(); // check -> { failures, alertedAt, message }

export const CHECKS = {
  database: async () => {
    const { error } = await supabase.from('player_registrations').select('id', { head: true, count: 'exact' }).limit(1);
    if (error) throw new Error(`Database query failed: ${error.message}`);
  },
  payments: async () => {
    if (!razorpayConfig.isConfigured()) return;
    const from = Math.floor(Date.now() / 1000) - 86400;
    await razorpayService.fetchPayments({ from, count: 1 });
  },
  emails: async () => {
    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data, error } = await supabase.from('email_logs').select('status').gte('sent_at', since).limit(200);
    if (error) return; // the database check reports database problems
    const failed = (data || []).filter((r) => r.status === 'failed').length;
    if (data.length >= 5 && failed / data.length >= 0.5) throw new Error(`${failed} of ${data.length} emails in the last hour failed to send`);
  },
  website: async () => {
    const res = await axios.get(env.siteUrl, { timeout: 15000, validateStatus: () => true });
    if (res.status >= 500) throw new Error(`${env.siteUrl} answered ${res.status}`);
  },
};

async function alert(subject, html) {
  const to = recipients();
  if (!to.length) {
    logger.error(`ALERT (ALERT_TO not set): ${subject}`);
    return;
  }
  for (const address of to) {
    const result = await emailService.sendEmail({ to: address, subject, html }).catch((err) => ({ success: false, error: err.message }));
    if (!result.success) logger.error(`ALERT email to ${address} failed (${result.error}): ${subject}`);
  }
}

/** Run every check once; returns { name: 'ok' | message }. */
export async function runChecks() {
  const out = {};
  for (const [name, check] of Object.entries(CHECKS)) {
    const s = state.get(name) || { failures: 0, alertedAt: 0, message: null };
    try {
      await check();
      if (s.alertedAt) await alert(`SSPL recovered: ${name}`, `<p>The <strong>${name}</strong> check is working again (${new Date().toLocaleString('en-IN')}).</p>`);
      state.set(name, { failures: 0, alertedAt: 0, message: null });
      out[name] = 'ok';
    } catch (err) {
      const message = err.response?.data?.error?.description || err.message;
      s.failures += 1;
      s.message = message;
      if (s.failures >= 2 && Date.now() - s.alertedAt > REPEAT_MS) {
        await alert(`SSPL alert: ${name} is not working`, `<p><strong>${name}</strong> has failed ${s.failures} checks in a row.</p><p>${message}</p><p>Checked ${new Date().toLocaleString('en-IN')}.</p>`);
        s.alertedAt = Date.now();
      }
      state.set(name, s);
      out[name] = message;
    }
  }
  return out;
}

export function start() {
  cron.schedule(SCHEDULE, () => runChecks().catch((err) => logger.error('Health checks failed to run:', err)));
  logger.info('Health alert job scheduled (every 5 minutes)');
}

import supabase from '../config/supabase.js';

// Numbers for the daily summary email and the data quality report (PRD section 9).
// A paid sign-up is counted the same way everywhere: payment_status in PAID.

export const PAID = ['captured', 'paid', 'completed', 'success'];
const last10 = (v) => String(v ?? '').replace(/\D/g, '').slice(-10);

async function fetchAll(table, select, apply = (q) => q) {
  const rows = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await apply(supabase.from(table).select(select)).order('created_at', { ascending: true }).range(from, from + 999);
    if (error) throw error;
    rows.push(...data);
    if (data.length < 1000) return rows;
  }
}

/** Start and end (ISO) of an IST calendar day; `daysAgo` 1 = yesterday. */
export function istDay(daysAgo = 1, now = new Date()) {
  const ist = new Date(now.getTime() + 330 * 60000);
  ist.setUTCHours(0, 0, 0, 0);
  ist.setUTCDate(ist.getUTCDate() - daysAgo);
  const start = new Date(ist.getTime() - 330 * 60000);
  const end = new Date(start.getTime() + 86400000 - 1);
  return { start: start.toISOString(), end: end.toISOString(), label: ist.toISOString().slice(0, 10) };
}

/** Daily summary: registrations, payments, revenue, failures, refunds, pending trial work. */
export async function dailySummary(daysAgo = 1) {
  const day = istDay(daysAgo);
  const inDay = (q) => q.gte('created_at', day.start).lte('created_at', day.end);
  const [regs, ledger, workflows] = await Promise.all([
    fetchAll('player_registrations', 'id,payment_status,utm_source,utm_campaign,qr_code_id,created_at', inDay),
    fetchAll('razorpay_ledger', 'payment_id,amount,status,created_at,raw_payload', inDay),
    fetchAll('player_workflow', 'workflow_id,workflow_stage,created_at'),
  ]);
  const captured = ledger.filter((p) => p.status === 'captured' || p.status === 'refunded');
  const refunded = ledger.filter((p) => p.status === 'refunded');
  return {
    day: day.label,
    registrations: regs.length,
    paidRegistrations: regs.filter((r) => PAID.includes(String(r.payment_status || '').toLowerCase())).length,
    withoutSource: regs.filter((r) => !r.utm_source && !r.utm_campaign && !r.qr_code_id).length,
    payments: captured.length,
    revenue: Math.round(captured.reduce((s, p) => s + (Number(p.amount) || 0), 0) * 100) / 100,
    failedPayments: ledger.filter((p) => p.status === 'failed').length,
    refunds: refunded.length,
    waitingForSlot: workflows.filter((w) => w.workflow_stage === 'trials_section').length,
  };
}

/**
 * Data quality (PRD section 9, weekly): registrations with no source, players registered
 * more than once (same mobile), paid registrations with no payment reference, and captured
 * payments that match no registration.
 */
export async function dataQuality() {
  const [regs, ledger] = await Promise.all([
    fetchAll('player_registrations', 'id,full_name,phone,email,payment_status,razorpay_payment_id,utm_source,utm_campaign,qr_code_id,team_id,created_at'),
    fetchAll('razorpay_ledger', 'payment_id,amount,status,email,contact,created_at'),
  ]);
  const byPhone = new Map();
  for (const r of regs) {
    const m = last10(r.phone);
    if (m.length !== 10) continue;
    if (!byPhone.has(m)) byPhone.set(m, []);
    byPhone.get(m).push(r);
  }
  const duplicates = [...byPhone.entries()].filter(([, rows]) => rows.length > 1)
    .map(([mobile, rows]) => ({
      mobile: `••••••${mobile.slice(-4)}`,
      count: rows.length,
      paid: rows.filter((r) => PAID.includes(String(r.payment_status || '').toLowerCase())).length,
      names: [...new Set(rows.map((r) => r.full_name).filter(Boolean))].slice(0, 3),
      ids: rows.map((r) => r.id),
    }))
    .sort((a, b) => b.count - a.count);
  const paymentIds = new Set(regs.map((r) => r.razorpay_payment_id).filter(Boolean));
  const unmatched = ledger.filter((p) => p.status === 'captured' && !paymentIds.has(p.payment_id));
  const paidNoRef = regs.filter((r) => PAID.includes(String(r.payment_status || '').toLowerCase()) && !r.razorpay_payment_id && !r.team_id);
  return {
    totalRegistrations: regs.length,
    missingSource: regs.filter((r) => !r.utm_source && !r.utm_campaign && !r.qr_code_id).length,
    duplicatePlayers: { groups: duplicates.length, extraRecords: duplicates.reduce((s, d) => s + d.count - 1, 0), top: duplicates.slice(0, 50) },
    paidWithoutPaymentId: paidNoRef.length,
    unmatchedPayments: {
      count: unmatched.length,
      amount: Math.round(unmatched.reduce((s, p) => s + (Number(p.amount) || 0), 0) * 100) / 100,
      list: unmatched.slice(0, 100).map((p) => ({ payment_id: p.payment_id, amount: p.amount, created_at: p.created_at, email: p.email })),
    },
  };
}

const inr = (n) => `₹${Math.round(n).toLocaleString('en-IN')}`;

/** HTML body for the 8 am email. */
export function summaryEmailHtml(s, siteUrl) {
  const row = (label, value) => `<tr><td style="padding:6px 16px 6px 0;color:#55607a">${label}</td><td style="padding:6px 0;font-weight:bold;color:#0a1240">${value}</td></tr>`;
  return `<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px">
<h2 style="color:#0a1240;margin:0 0 4px">SSPL daily summary</h2>
<p style="color:#55607a;margin:0 0 16px">${s.day} (IST)</p>
<table style="border-collapse:collapse">
${row('New registrations', s.registrations.toLocaleString('en-IN'))}
${row('Paid registrations', s.paidRegistrations.toLocaleString('en-IN'))}
${row('Payments captured', `${s.payments.toLocaleString('en-IN')} · ${inr(s.revenue)}`)}
${row('Failed payments', s.failedPayments.toLocaleString('en-IN'))}
${row('Refunds', s.refunds.toLocaleString('en-IN'))}
${row('Sign-ups with no source', s.withoutSource.toLocaleString('en-IN'))}
${row('Paid players waiting for a trial slot', s.waitingForSlot.toLocaleString('en-IN'))}
</table>
<p style="margin-top:20px"><a href="${siteUrl}/admin" style="color:#1f57d6">Open the admin dashboard</a></p>
</div>`;
}

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { RefreshCw, Send, AlertTriangle, Users, IndianRupee, Tag, Download } from 'lucide-react';
import { PageHeader, StatCard, ActionButton, DataTableShell } from '@/components/admin/ui';
import { adminApi } from '@/lib/adminApi';
import { useAuth } from '@/hooks/useAuth';

// Daily summary and data quality (PRD section 9): what the 8 am email says, and the records
// that need cleaning up.

interface Summary { day: string; registrations: number; paidRegistrations: number; withoutSource: number; payments: number; revenue: number; failedPayments: number; refunds: number; waitingForSlot: number }
interface Quality {
  totalRegistrations: number;
  missingSource: number;
  duplicatePlayers: { groups: number; extraRecords: number; top: { mobile: string; count: number; paid: number; names: string[] }[] };
  paidWithoutPaymentId: number;
  unmatchedPayments: { count: number; amount: number; list: { payment_id: string; amount: number; created_at: string; email: string | null }[] };
}

const num = (n: number) => n.toLocaleString('en-IN');
const inr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

function downloadCsv(name: string, rows: (string | number | null)[][]) {
  const csv = rows.map((r) => r.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

const DataQuality = () => {
  const { hasPermission } = useAuth();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [quality, setQuality] = useState<Quality | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [view, setView] = useState<'payments' | 'duplicates'>('payments');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, q] = await Promise.all([
        adminApi.get<Summary>('/admin/reports/daily-summary?daysAgo=1'),
        adminApi.get<Quality>('/admin/reports/data-quality'),
      ]);
      setSummary(s);
      setQuality(q);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const sendNow = async () => {
    setSending(true);
    try {
      const res = await adminApi.post<{ sent: boolean }>('/admin/reports/daily-summary/send');
      if (res.sent) toast.success('Daily summary emailed');
      else toast.error('Not sent: no recipients', { description: 'Set DAILY_SUMMARY_TO on the server (comma-separated emails).' });
    } catch (err) {
      toast.error('Could not send', { description: (err as Error).message });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Reports"
        title={<>Data <em>quality</em></>}
        description="Yesterday's numbers (the 8 am email) and the records that need cleaning up."
        actions={(
          <>
            <ActionButton variant="ghost" icon={RefreshCw} loading={loading} onClick={load}>Refresh</ActionButton>
            {hasPermission('manage_staff') && <ActionButton variant="outline" icon={Send} loading={sending} onClick={sendNow}>Email summary now</ActionButton>}
          </>
        )}
      />

      {error && <div role="alert" className="admin-card p-4 text-[var(--admin-bad)]">{error}</div>}

      <section aria-labelledby="summary-h" className="space-y-3">
        <h2 id="summary-h" className="admin-eyebrow">Yesterday {summary ? `· ${summary.day}` : ''}</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="New registrations" value={summary ? num(summary.registrations) : '—'} hint={summary ? `${num(summary.paidRegistrations)} paid` : undefined} icon={Users} loading={loading && !summary} />
          <StatCard label="Revenue" value={summary ? inr(summary.revenue) : '—'} hint={summary ? `${num(summary.payments)} payments` : undefined} icon={IndianRupee} tone="green" loading={loading && !summary} />
          <StatCard label="Failed payments" value={summary ? num(summary.failedPayments) : '—'} hint={summary ? `${num(summary.refunds)} refunds` : undefined} icon={AlertTriangle} tone="amber" loading={loading && !summary} />
          <StatCard label="Waiting for a trial slot" value={summary ? num(summary.waitingForSlot) : '—'} icon={Users} tone="blue" loading={loading && !summary} />
        </div>
      </section>

      <section aria-labelledby="quality-h" className="space-y-3">
        <h2 id="quality-h" className="admin-eyebrow">Data quality</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="No source recorded" value={quality ? num(quality.missingSource) : '—'} hint={quality ? `of ${num(quality.totalRegistrations)} registrations` : undefined} icon={Tag} tone="amber" loading={loading && !quality} />
          <StatCard label="Mobiles registered twice or more" value={quality ? num(quality.duplicatePlayers.groups) : '—'} hint={quality ? `${num(quality.duplicatePlayers.extraRecords)} extra records` : undefined} icon={Users} tone="amber" loading={loading && !quality} />
          <StatCard label="Payments with no registration" value={quality ? num(quality.unmatchedPayments.count) : '—'} hint={quality ? inr(quality.unmatchedPayments.amount) : undefined} icon={IndianRupee} tone="lime" loading={loading && !quality} />
          <StatCard label="Paid but no payment reference" value={quality ? num(quality.paidWithoutPaymentId) : '—'} icon={AlertTriangle} loading={loading && !quality} />
        </div>
      </section>

      <DataTableShell
        title={view === 'payments' ? 'Captured payments that match no registration' : 'Mobiles registered more than once'}
        description={view === 'payments'
          ? 'Money received with no player record. Match each one to a player, or refund it.'
          : 'One person should have one record (PRD: duplicates are merged, not created). Newest registrations are already protected.'}
        filters={[{ value: 'payments', label: 'Unmatched payments', count: quality?.unmatchedPayments.count }, { value: 'duplicates', label: 'Duplicate players', count: quality?.duplicatePlayers.groups }]}
        activeFilter={view}
        onFilterChange={(v) => setView(v as 'payments' | 'duplicates')}
        actions={quality && (
          <ActionButton size="sm" variant="ghost" icon={Download} onClick={() => (view === 'payments'
            ? downloadCsv('unmatched-payments.csv', [['Payment ID', 'Amount', 'Date', 'Email'], ...quality.unmatchedPayments.list.map((p) => [p.payment_id, p.amount, p.created_at, p.email])])
            : downloadCsv('duplicate-players.csv', [['Mobile (last 4)', 'Records', 'Paid', 'Names'], ...quality.duplicatePlayers.top.map((d) => [d.mobile, d.count, d.paid, d.names.join(' / ')])]))}>
            Export
          </ActionButton>
        )}
        loading={loading && !quality}
        isEmpty={!loading && Boolean(quality) && quality !== null && (view === 'payments' ? quality.unmatchedPayments.list.length === 0 : quality.duplicatePlayers.top.length === 0)}
        emptyTitle="Nothing to fix"
      >
        {quality && view === 'payments' && (
          <table className="admin-table">
            <thead><tr><th>Payment</th><th className="text-right">Amount</th><th>Date</th><th>Payer email</th></tr></thead>
            <tbody>
              {quality.unmatchedPayments.list.map((p) => (
                <tr key={p.payment_id}>
                  <td className="font-mono text-sm">{p.payment_id}</td>
                  <td className="text-right tabular-nums">{inr(Number(p.amount) || 0)}</td>
                  <td className="whitespace-nowrap">{new Date(p.created_at).toLocaleDateString('en-IN')}</td>
                  <td className="admin-muted">{p.email || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {quality && view === 'duplicates' && (
          <table className="admin-table">
            <thead><tr><th>Mobile</th><th className="text-right">Records</th><th className="text-right">Paid</th><th>Names used</th></tr></thead>
            <tbody>
              {quality.duplicatePlayers.top.map((d) => (
                <tr key={d.mobile + d.names.join()}>
                  <td className="font-mono">{d.mobile}</td>
                  <td className="text-right tabular-nums">{d.count}</td>
                  <td className="text-right tabular-nums">{d.paid}</td>
                  <td className="admin-muted">{d.names.join(' · ') || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </DataTableShell>
    </div>
  );
};

export default DataQuality;

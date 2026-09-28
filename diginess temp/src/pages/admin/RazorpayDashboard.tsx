import { useState, useEffect, useCallback, useMemo } from 'react';
import { Download, RefreshCw, ExternalLink, Copy, IndianRupee, CheckCircle2, XCircle, Receipt, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { PageHeader, StatCard, StatusBadge, ActionButton, DataTableShell, DetailDrawer } from '@/components/admin/ui';

interface Txn {
  payment_id: string;
  order_id?: string | null;
  created_at: string;
  contact?: string | null;
  email?: string | null;
  amount?: number | null;
  method?: string | null;
  status: string;
  razorpay_dashboard_url?: string | null;
  [key: string]: unknown;
}

const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'captured', label: 'Paid' },
  { value: 'failed', label: 'Failed' },
  { value: 'created', label: 'Pending' },
  { value: 'authorized', label: 'Authorized' },
];

const LIMIT = 50;
const inr = (n: number) => `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const copy = async (text: string, what: string) => {
  try { await navigator.clipboard.writeText(text); toast.success(`${what} copied`); } catch { toast.error('Could not copy'); }
};

export default function RazorpayDashboard() {
  const [transactions, setTransactions] = useState<Txn[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [viewMode] = useState('all'); // all, captured, net_failed
  const [selected, setSelected] = useState<Txn | null>(null);
  const { session } = useAuth();

  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3003/api';

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({ page: page.toString(), limit: LIMIT.toString() });
      if (debouncedSearch) queryParams.append('search', debouncedSearch);
      if (status && status !== 'all') queryParams.append('status', status);
      if (viewMode !== 'all') queryParams.append('view', viewMode);

      const response = await fetch(`${apiBase}/admin/razorpay/transactions?${queryParams}`, {
        headers: { Authorization: `Bearer ${session?.access_token || ''}` },
      });
      if (!response.ok) throw new Error('Failed to fetch transactions');
      const result = await response.json();
      setTransactions(result.data || []);
      setTotal(result.pagination?.total || 0);
    } catch (error) {
      console.error('Error fetching razorpay transactions:', error);
      toast.error('Could not load transactions');
    } finally {
      setLoading(false);
    }
  }, [apiBase, page, debouncedSearch, status, viewMode, session]);

  useEffect(() => {
    if (session) fetchTransactions();
  }, [fetchTransactions, session]);

  const handleExport = () => {
    const queryParams = new URLSearchParams();
    if (debouncedSearch) queryParams.append('search', debouncedSearch);
    if (status && status !== 'all') queryParams.append('status', status);
    if (viewMode !== 'all') queryParams.append('view', viewMode);
    window.open(`${apiBase}/admin/razorpay/transactions/export?${queryParams}`, '_blank');
    toast.success('Export started');
  };

  const totalPages = Math.ceil(total / LIMIT) || 1;

  const pageStats = useMemo(() => {
    const paid = transactions.filter(t => t.status === 'captured');
    return {
      paidCount: paid.length,
      failedCount: transactions.filter(t => t.status === 'failed').length,
      paidSum: paid.reduce((s, t) => s + (t.amount || 0), 0),
    };
  }, [transactions]);

  const dashUrl = (t: Txn) => t.razorpay_dashboard_url || `https://dashboard.razorpay.com/app/payments/${t.payment_id}`;

  const pageNumbers = [...Array(Math.min(5, totalPages))].map((_, i) => {
    if (totalPages <= 5 || page <= 3) return i + 1;
    if (page >= totalPages - 2) return totalPages - 4 + i;
    return page - 2 + i;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Payments"
        title={<>Razorpay <em>payments</em></>}
        description="View and manage all payment transactions from the Razorpay ledger."
        actions={
          <>
            <ActionButton variant="outline" icon={RefreshCw} onClick={fetchTransactions} disabled={loading}>Refresh</ActionButton>
            <ActionButton variant="primary" icon={Download} onClick={handleExport}>Export CSV</ActionButton>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Transactions" value={total.toLocaleString('en-IN')} hint="Matching current filters" icon={Receipt} loading={loading} />
        <StatCard label="Paid on this page" value={pageStats.paidCount} hint={`of ${transactions.length} shown`} icon={CheckCircle2} tone="green" loading={loading} />
        <StatCard label="Collected on this page" value={inr(pageStats.paidSum)} hint="Captured payments only" icon={IndianRupee} tone="lime" loading={loading} />
        <StatCard label="Failed on this page" value={pageStats.failedCount} hint="Needs follow-up" icon={XCircle} tone="amber" loading={loading} />
      </div>

      <DataTableShell
        title="Transactions"
        description={`Showing ${transactions.length} of ${total} transactions`}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search phone, email, payment ID"
        filters={STATUS_FILTERS}
        activeFilter={status}
        onFilterChange={(v) => { setStatus(v); setPage(1); }}
        loading={loading}
        isEmpty={transactions.length === 0}
        emptyTitle="No transactions found"
        emptyDescription="Try a different search or status filter."
      >
        <table className="admin-table">
          <thead>
            <tr>
              <th>Date</th><th>Payment ID</th><th>Contact / email</th><th>Amount</th><th>Method</th><th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((txn) => (
              <tr key={txn.payment_id} className="cursor-pointer" onClick={() => setSelected(txn)}>
                <td className="whitespace-nowrap">{format(new Date(txn.created_at), 'dd MMM yyyy, hh:mm a')}</td>
                <td>
                  <button
                    type="button"
                    title="Copy payment ID"
                    onClick={(e) => { e.stopPropagation(); copy(txn.payment_id, 'Payment ID'); }}
                    className="inline-flex items-center gap-1.5 font-mono text-[var(--admin-ink)] hover:text-[var(--admin-accent)]"
                  >
                    {txn.payment_id}<Copy className="h-3.5 w-3.5" />
                  </button>
                  {txn.order_id && <span className="admin-muted block font-mono">{txn.order_id}</span>}
                </td>
                <td>
                  <span className="block font-semibold text-[var(--admin-ink)]">{txn.contact || '-'}</span>
                  <span className="admin-muted">{txn.email || '-'}</span>
                </td>
                <td><span className="admin-num !text-[length:var(--brand-fs-h3)]">{inr(Number(txn.amount || 0))}</span></td>
                <td className="capitalize">{txn.method || '-'}</td>
                <td><StatusBadge status={txn.status} /></td>
                <td className="text-right" onClick={(e) => e.stopPropagation()}>
                  <a href={dashUrl(txn)} target="_blank" rel="noopener noreferrer" className="admin-btn admin-btn--ghost admin-btn--sm">
                    {txn.razorpay_dashboard_url ? 'Dashboard' : 'View'}<ExternalLink className="h-4 w-4" />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--admin-line)] px-5 py-3">
            <p className="admin-muted">Page {page} of {totalPages}</p>
            <div className="flex items-center gap-2">
              <ActionButton variant="outline" size="sm" icon={ChevronLeft} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} aria-label="Previous page" />
              {pageNumbers.map((n) => (
                <button key={n} type="button" className="admin-chip" data-active={page === n} onClick={() => setPage(n)}>{n}</button>
              ))}
              <ActionButton variant="outline" size="sm" icon={ChevronRight} onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} aria-label="Next page" />
            </div>
          </div>
        )}
      </DataTableShell>

      <DetailDrawer
        open={!!selected}
        onOpenChange={(o) => { if (!o) setSelected(null); }}
        eyebrow="Payment"
        title={selected ? inr(Number(selected.amount || 0)) : ''}
        description={selected ? format(new Date(selected.created_at), 'dd MMM yyyy, hh:mm a') : undefined}
        footer={selected && (
          <a href={dashUrl(selected)} target="_blank" rel="noopener noreferrer" className="admin-btn admin-btn--primary">
            Open in Razorpay<ExternalLink className="h-4 w-4" />
          </a>
        )}
      >
        {selected && (
          <div className="space-y-5">
            <StatusBadge status={selected.status} />
            <dl className="admin-kv">
              <dt>Payment ID</dt>
              <dd><button type="button" onClick={() => copy(selected.payment_id, 'Payment ID')} className="inline-flex items-center gap-1.5 font-mono hover:text-[var(--admin-accent)]">{selected.payment_id}<Copy className="h-3.5 w-3.5" /></button></dd>
              <dt>Order ID</dt>
              <dd>{selected.order_id ? <button type="button" onClick={() => copy(selected.order_id as string, 'Order ID')} className="inline-flex items-center gap-1.5 font-mono hover:text-[var(--admin-accent)]">{selected.order_id}<Copy className="h-3.5 w-3.5" /></button> : '-'}</dd>
              <dt>Contact</dt><dd>{selected.contact || '-'}</dd>
              <dt>Email</dt><dd>{selected.email || '-'}</dd>
              <dt>Method</dt><dd className="capitalize">{selected.method || '-'}</dd>
            </dl>
          </div>
        )}
      </DetailDrawer>
    </div>
  );
}

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { RefreshCw, Phone, ChevronLeft, ChevronRight, Download, Check, Undo2 } from 'lucide-react';
import { PageHeader, ActionButton, DataTableShell, StatusBadge } from '@/components/admin/ui';
import { adminApi } from '@/lib/adminApi';

// Visitor follow-up call list (PRD 7.9): people who showed interest but did not register,
// or registered and did not pay, with the campaign that brought them.

interface Lead {
  id: string;
  created_at: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  utm_source: string | null;
  utm_campaign: string | null;
  page_url: string | null;
  contacted_at?: string | null;
  contacted_by?: string | null;
  outcome: 'not_registered' | 'unpaid' | 'paid';
}
interface Res { counts: Record<string, number>; total: number; page: number; limit: number; data: Lead[] }

const VIEWS = [
  { value: 'not_registered', label: 'Did not register' },
  { value: 'unpaid', label: 'Registered, not paid' },
  { value: 'contacted', label: 'Called' },
  { value: 'all', label: 'All' },
];

const FollowUpCalls = () => {
  const [view, setView] = useState('not_registered');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [res, setRes] = useState<Res | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ view, page: String(page) });
      if (search.trim()) params.set('search', search.trim());
      setRes(await adminApi.get<Res>(`/admin/leads?${params}`));
    } catch (err) {
      toast.error('Could not load the call list', { description: (err as Error).message });
    } finally {
      setLoading(false);
    }
  }, [view, page, search]);
  useEffect(() => {
    const t = setTimeout(load, search ? 350 : 0);
    return () => clearTimeout(t);
  }, [load, search]);

  const mark = async (lead: Lead, contacted: boolean) => {
    try {
      await adminApi.patch(`/admin/leads/${lead.id}`, { contacted });
      toast.success(contacted ? 'Marked as called' : 'Moved back to the list');
      load();
    } catch (err) {
      toast.error('Not saved', { description: (err as Error).message });
    }
  };

  const exportPage = () => {
    if (!res) return;
    const rows = [['Name', 'Phone', 'Email', 'Source', 'Campaign', 'Date', 'Status'],
      ...res.data.map((l) => [l.name, l.phone, l.email, l.utm_source, l.utm_campaign, l.created_at.slice(0, 10), l.outcome])];
    const csv = rows.map((r) => r.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `follow-up-${view}-page-${page}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const pages = res ? Math.max(1, Math.ceil(res.total / res.limit)) : 1;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Growth"
        title={<>Follow-up <em>calls</em></>}
        description="People who showed interest but did not register or pay, newest first, one row per mobile."
        actions={<ActionButton variant="ghost" icon={RefreshCw} loading={loading} onClick={load}>Refresh</ActionButton>}
      />
      <DataTableShell
        title={VIEWS.find((v) => v.value === view)?.label || ''}
        description={res ? `${res.total.toLocaleString('en-IN')} people` : undefined}
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder="Search name, phone, email, campaign…"
        filters={VIEWS.map((v) => ({ ...v, count: res?.counts[v.value] }))}
        activeFilter={view}
        onFilterChange={(v) => { setView(v); setPage(1); }}
        actions={<ActionButton size="sm" variant="ghost" icon={Download} onClick={exportPage} disabled={!res?.data.length}>Export page</ActionButton>}
        loading={loading && !res}
        isEmpty={!loading && Boolean(res) && res?.data.length === 0}
        emptyTitle="Nobody to call here"
      >
        <table className="admin-table">
          <thead><tr><th>Person</th><th>Campaign</th><th>Came in</th><th>Status</th><th className="text-right">Actions</th></tr></thead>
          <tbody>
            {res?.data.map((l) => (
              <tr key={l.id}>
                <td>
                  <span className="block font-semibold text-[var(--admin-ink)]">{l.name || 'No name'}</span>
                  <span className="admin-muted text-sm">{[l.phone, l.email].filter(Boolean).join(' · ') || '—'}</span>
                </td>
                <td>{l.utm_campaign || <span className="admin-muted">Unknown</span>}{l.utm_source && <span className="admin-muted block text-sm">{l.utm_source}</span>}</td>
                <td className="whitespace-nowrap">{new Date(l.created_at).toLocaleDateString('en-IN')}</td>
                <td>
                  <StatusBadge status={l.outcome === 'unpaid' ? 'pending' : l.outcome === 'paid' ? 'paid' : 'neutral'} label={l.outcome === 'unpaid' ? 'Not paid' : l.outcome === 'paid' ? 'Paid' : 'Not registered'} />
                  {l.contacted_at && <span className="admin-muted mt-1 block text-xs">Called {new Date(l.contacted_at).toLocaleDateString('en-IN')}{l.contacted_by ? ` by ${l.contacted_by}` : ''}</span>}
                </td>
                <td>
                  <div className="flex justify-end gap-2">
                    {l.phone && <a href={`tel:${l.phone}`} className="admin-btn admin-btn--soft admin-btn--sm" aria-label={`Call ${l.name || l.phone}`}><Phone className="h-4 w-4" />Call</a>}
                    {l.contacted_at
                      ? <ActionButton size="sm" variant="ghost" icon={Undo2} onClick={() => mark(l, false)}>Undo</ActionButton>
                      : <ActionButton size="sm" variant="outline" icon={Check} onClick={() => mark(l, true)}>Called</ActionButton>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {res && res.total > res.limit && (
          <div className="flex items-center justify-between gap-3 border-t border-[var(--admin-line)] px-4 py-3">
            <span className="admin-muted text-sm">Page {page} of {pages}</span>
            <div className="flex gap-2">
              <ActionButton variant="ghost" size="sm" icon={ChevronLeft} disabled={page <= 1} onClick={() => setPage(page - 1)} aria-label="Previous page" />
              <ActionButton variant="ghost" size="sm" icon={ChevronRight} disabled={page >= pages} onClick={() => setPage(page + 1)} aria-label="Next page" />
            </div>
          </div>
        )}
      </DataTableShell>
    </div>
  );
};

export default FollowUpCalls;

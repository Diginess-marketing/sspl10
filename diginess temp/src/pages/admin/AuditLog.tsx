import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { RefreshCw, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { PageHeader, ActionButton, DataTableShell, StatusBadge, ConfirmDialog, DetailDrawer } from '@/components/admin/ui';
import { adminApi } from '@/lib/adminApi';
import { STAFF_ROLES, staffRoleOf } from '@/lib/staffRoles';

// Who did what, when (PRD: every admin edit, delete, send and refund is recorded), and the
// 30-day bin for deleted items.

interface AuditEntry {
  id: number;
  created_at: string;
  actor_email: string | null;
  staff_role: string | null;
  source: 'api' | 'db';
  action: string;
  entity: string | null;
  entity_id: string | null;
  status: number | null;
  details: Record<string, unknown>;
  restored_at: string | null;
}

const PAGE_SIZE = 50;
const when = (d: string) => new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });

/** Plain-language description of an entry. */
function describe(e: AuditEntry): string {
  const thing = (e.entity || 'record').replace(/_/g, ' ');
  if (e.source === 'db') {
    if (e.action === 'DELETE') return `Deleted a ${thing}`;
    if (e.action === 'INSERT') return `Added a ${thing}`;
    const changed = Object.keys((e.details?.changed as Record<string, unknown>) || {});
    return `Changed ${thing}${changed.length ? `: ${changed.slice(0, 4).join(', ')}${changed.length > 4 ? '…' : ''}` : ''}`;
  }
  const [method, path] = e.action.split(' ');
  const area = (path || '').replace(/^\/api\/admin\//, '').replace(/\//g, ' › ');
  return `${method === 'DELETE' ? 'Removed' : method === 'GET' ? 'Viewed' : 'Did'} ${area}`;
}

const AuditLog = () => {
  const [rows, setRows] = useState<AuditEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [view, setView] = useState<'all' | 'bin'>('all');
  const [actor, setActor] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<AuditEntry | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<AuditEntry | null>(null);
  const [restoring, setRestoring] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
      if (view === 'bin') params.set('bin', '1');
      if (actor.trim()) params.set('actor', actor.trim());
      const res = await adminApi.get<{ data: AuditEntry[]; total: number }>(`/admin/audit?${params}`);
      setRows(res.data || []);
      setTotal(res.total || 0);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [page, view, actor]);

  useEffect(() => { load(); }, [load]);

  const restore = async () => {
    if (!restoreTarget) return;
    setRestoring(true);
    try {
      await adminApi.post(`/admin/audit/${restoreTarget.id}/restore`);
      toast.success('Restored', { description: `${(restoreTarget.entity || 'Item').replace(/_/g, ' ')} is back.` });
      setRestoreTarget(null);
      load();
    } catch (err) {
      toast.error('Could not restore', { description: (err as Error).message });
    } finally {
      setRestoring(false);
    }
  };

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="System"
        title={<>Action <em>history</em></>}
        description="Every change made by an admin: who, what and when. Deleted items can be restored for 30 days."
        actions={<ActionButton variant="ghost" icon={RefreshCw} loading={loading} onClick={load}>Refresh</ActionButton>}
      />

      {error && <div role="alert" className="admin-card p-4 text-[var(--admin-bad)]">{error}</div>}

      <DataTableShell
        title={view === 'bin' ? 'Bin' : 'All actions'}
        description={view === 'bin' ? 'Items deleted in the last 30 days.' : `${total.toLocaleString('en-IN')} recorded actions, newest first.`}
        search={actor}
        onSearchChange={(v) => { setActor(v); setPage(1); }}
        searchPlaceholder="Filter by admin email…"
        filters={[{ value: 'all', label: 'All actions' }, { value: 'bin', label: 'Deleted (bin)' }]}
        activeFilter={view}
        onFilterChange={(v) => { setView(v as 'all' | 'bin'); setPage(1); }}
        loading={loading && rows.length === 0}
        isEmpty={!loading && rows.length === 0}
        emptyTitle={view === 'bin' ? 'The bin is empty' : 'No actions recorded yet'}
        emptyDescription={view === 'bin' ? 'Nothing was deleted in the last 30 days.' : 'Actions appear here as admins make changes.'}
      >
        <table className="admin-table">
          <thead>
            <tr><th>When</th><th>Who</th><th>What</th><th>Item</th><th className="text-right">Actions</th></tr>
          </thead>
          <tbody>
            {rows.map((e) => (
              <tr key={e.id} className="cursor-pointer" onClick={() => setOpen(e)}>
                <td className="whitespace-nowrap">{when(e.created_at)}</td>
                <td>
                  <span className="block font-semibold text-[var(--admin-ink)]">{e.actor_email || 'Unknown'}</span>
                  <span className="admin-muted text-sm">{STAFF_ROLES[staffRoleOf(e.staff_role)].label}</span>
                </td>
                <td>
                  {describe(e)}
                  {e.status && e.status >= 400 && <span className="ml-2"><StatusBadge status="failed" label={`Failed (${e.status})`} /></span>}
                </td>
                <td className="admin-muted max-w-[180px] truncate font-mono text-xs" title={e.entity_id || ''}>{e.entity_id || '—'}</td>
                <td className="text-right" onClick={(ev) => ev.stopPropagation()}>
                  {e.action === 'DELETE' && Boolean(e.details?.deleted_row) && (e.restored_at
                    ? <StatusBadge status="completed" label="Restored" />
                    : <ActionButton size="sm" variant="soft" icon={RotateCcw} onClick={() => setRestoreTarget(e)}>Restore</ActionButton>)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {total > PAGE_SIZE && (
          <div className="flex items-center justify-between gap-3 border-t border-[var(--admin-line)] px-4 py-3">
            <span className="admin-muted text-sm">Page {page} of {pages}</span>
            <div className="flex gap-2">
              <ActionButton variant="ghost" size="sm" icon={ChevronLeft} disabled={page <= 1} onClick={() => setPage(page - 1)} aria-label="Previous page" />
              <ActionButton variant="ghost" size="sm" icon={ChevronRight} disabled={page >= pages} onClick={() => setPage(page + 1)} aria-label="Next page" />
            </div>
          </div>
        )}
      </DataTableShell>

      <DetailDrawer
        open={open !== null}
        onOpenChange={(o) => { if (!o) setOpen(null); }}
        eyebrow="Action"
        title={open ? describe(open) : ''}
        description={open ? `${open.actor_email || 'Unknown'} · ${when(open.created_at)}` : undefined}
      >
        {open && (
          <div className="space-y-4">
            <dl className="admin-kv">
              <dt>Action</dt><dd className="font-mono text-sm">{open.action}</dd>
              <dt>Area</dt><dd>{open.entity || '—'}</dd>
              <dt>Item id</dt><dd className="break-all font-mono text-sm">{open.entity_id || '—'}</dd>
              {open.status !== null && <><dt>Result</dt><dd>{open.status}</dd></>}
            </dl>
            <pre className="max-h-[50vh] overflow-auto rounded-xl bg-[var(--admin-bg)] p-4 text-xs">{JSON.stringify(open.details, null, 2)}</pre>
          </div>
        )}
      </DetailDrawer>

      <ConfirmDialog
        open={restoreTarget !== null}
        onOpenChange={(o) => { if (!o) setRestoreTarget(null); }}
        title="Restore this item?"
        description={`The deleted ${(restoreTarget?.entity || 'item').replace(/_/g, ' ')} is put back exactly as it was when it was deleted.`}
        confirmLabel="Restore"
        loading={restoring}
        onConfirm={restore}
      />
    </div>
  );
};

export default AuditLog;

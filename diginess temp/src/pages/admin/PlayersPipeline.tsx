import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw, ArrowRightLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { PageHeader, ActionButton, DataTableShell, StatusBadge } from '@/components/admin/ui';
import { usePlayerPipeline, canMoveToTrials, type PipelinePlayer } from '@/hooks/usePlayerPipeline';
import { usePlayerWorkflow } from '@/hooks/usePlayerWorkflow';
import { PlayerPanel, STAGE_LABEL } from '@/components/admin/players/PlayerPanel';

const PAGE_SIZE = 50;

type Filter = 'all' | 'awaiting' | 'not_paid' | 'scheduled' | 'trial' | 'l4' | 'l5' | 'selected' | 'not_selected' | 'absent';

const matches = (p: PipelinePlayer, f: Filter) => {
  switch (f) {
    case 'all': return true;
    case 'awaiting': return p.stage === 'registered';
    case 'not_paid': return !p.paid;
    case 'scheduled': return Boolean(p.slot);
    default: return p.stage === f;
  }
};

/** Short status for the table: what is happening with the player right now. */
function statusOf(p: PipelinePlayer): { status: string; label: string } {
  if (!p.paid) return { status: p.paymentStatus === 'failed' ? 'failed' : 'pending', label: p.paymentStatus === 'failed' ? 'Payment failed' : 'Not paid' };
  if (p.stage === 'selected') return { status: 'selected', label: 'Selected' };
  if (p.stage === 'not_selected') return { status: 'not_selected', label: 'Not selected' };
  if (p.stage === 'absent') return { status: 'absent', label: 'Absent' };
  if (p.stage === 'registered') return { status: 'registration', label: 'Awaiting trial' };
  const lvl = Math.min(Math.max(p.currentLevel ?? 1, 1), 5);
  const att = (p.levels[lvl]?.attendance || '').toUpperCase();
  if (att === 'ATTENDED') return { status: 'attended', label: `L${lvl} attended` };
  if (p.slot) return { status: 'trials_allocated', label: 'Allocated' };
  return { status: 'trials_section', label: 'In trials' };
}

const Tile = ({ eyebrow, title, value, hint, active, onClick }: { eyebrow: string; title: string; value: number | string; hint?: string; active: boolean; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className="admin-card flex flex-col items-start p-4 text-left transition-shadow hover:shadow-md"
    style={active ? { background: 'var(--brand-navy)', borderColor: 'var(--brand-navy)' } : undefined}
  >
    <span className="admin-eyebrow !mb-1" style={active ? { color: 'rgba(255,255,255,0.65)' } : undefined}>{eyebrow}</span>
    <span className="admin-eyebrow !mb-1 !text-[13px]" style={{ color: active ? '#fff' : 'var(--admin-ink)' }}>{title}</span>
    <span className="admin-num text-2xl font-bold" style={{ color: active ? '#fff' : 'var(--admin-ink)' }}>{value}</span>
    {hint && <span className="mt-0.5 text-xs" style={{ color: active ? 'rgba(255,255,255,0.7)' : 'var(--admin-ink-soft)' }}>{hint}</span>}
  </button>
);

const PlayersPipeline = () => {
  const { players, loading, error, reload } = usePlayerPipeline();
  const { moveToTrialsSection } = usePlayerWorkflow();
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [openId, setOpenId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [moving, setMoving] = useState(false);

  const count = (f: Filter) => players.filter((p) => matches(p, f)).length;
  const counts = useMemo(() => Object.fromEntries(
    (['all', 'awaiting', 'not_paid', 'scheduled', 'trial', 'l4', 'l5', 'selected', 'not_selected', 'absent'] as Filter[]).map((f) => [f, count(f)]),
  ) as Record<Filter, number>, [players]); // eslint-disable-line react-hooks/exhaustive-deps
  const awaitingNotPaid = useMemo(() => players.filter((p) => p.stage === 'registered' && !p.paid).length, [players]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return players.filter((p) => matches(p, filter) && (!q
      || p.name.toLowerCase().includes(q) || p.phone.includes(q) || (p.email || '').toLowerCase().includes(q) || (p.city || '').toLowerCase().includes(q)));
  }, [players, filter, search]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages - 1);
  const rows = filtered.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);
  const open = players.find((p) => p.id === openId) || null;

  const pick = (f: Filter) => { setFilter(f); setPage(0); setSelected(new Set()); };
  const toggle = (id: string) => setSelected((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const allOnPage = rows.length > 0 && rows.every((r) => selected.has(r.id));

  // Paid players not yet moved to the trials section (same rule as the backend)
  const movable = players.filter((p) => selected.has(p.id) && canMoveToTrials(p)).map((p) => p.id);

  const moveSelected = async () => {
    const ids = movable;
    if (!ids.length) return;
    setMoving(true);
    try {
      const res = await moveToTrialsSection(ids);
      // Put newly moved players on the L1-L5 tracker too (best effort)
      await (supabase as any).rpc('sync_trial_candidates'); // errors come back in the result, not thrown
      const ok = res.filter((r) => r.success).length;
      toast.success(`${ok} player(s) moved to trials`, res.length - ok ? { description: `${res.length - ok} could not be moved` } : undefined);
      setSelected(new Set());
      reload();
    } catch (err: any) {
      toast.error('Could not move players', { description: err.message });
    } finally {
      setMoving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Players & Trials"
        title={<>All <em>players</em></>}
        description="Every registration in one place — from payment to trials, levels and final selection."
        actions={<ActionButton variant="ghost" icon={RefreshCw} loading={loading} onClick={reload}>Refresh</ActionButton>}
      />

      {error && <div role="alert" className="admin-card p-4 text-[var(--admin-bad)]">{error}</div>}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Tile eyebrow="Everyone" title="All registrations" value={loading ? '—' : counts.all} active={filter === 'all'} onClick={() => pick('all')} />
        <Tile eyebrow="Awaiting trial" title="Registered" value={loading ? '—' : counts.awaiting} hint={loading ? undefined : `${awaitingNotPaid} not paid yet`} active={filter === 'awaiting'} onClick={() => pick('awaiting')} />
        <Tile eyebrow="Stage" title="Trial L1–L3" value={loading ? '—' : counts.trial} active={filter === 'trial'} onClick={() => pick('trial')} />
        <Tile eyebrow="Stage" title="Level 4" value={loading ? '—' : counts.l4} active={filter === 'l4'} onClick={() => pick('l4')} />
        <Tile eyebrow="Stage" title="Level 5" value={loading ? '—' : counts.l5} active={filter === 'l5'} onClick={() => pick('l5')} />
        <Tile eyebrow="Final" title="Selected" value={loading ? '—' : counts.selected} active={filter === 'selected'} onClick={() => pick('selected')} />
      </div>

      <DataTableShell
        title="Registrations"
        description="Every registration in one list. Click a row for the full picture."
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(0); }}
        searchPlaceholder="Search name, phone, email, city…"
        filters={[
          { value: 'all', label: 'All', count: counts.all },
          { value: 'not_paid', label: 'Not paid', count: counts.not_paid },
          { value: 'scheduled', label: 'Scheduled', count: counts.scheduled },
          { value: 'not_selected', label: 'Not selected', count: counts.not_selected },
          { value: 'absent', label: 'Absent', count: counts.absent },
        ]}
        activeFilter={filter}
        onFilterChange={(v) => pick(v as Filter)}
        selectedCount={selected.size}
        onClearSelection={() => setSelected(new Set())}
        bulkActions={movable.length > 0
          ? <ActionButton variant="primary" size="sm" icon={ArrowRightLeft} loading={moving} onClick={moveSelected}>Move {movable.length} to trials</ActionButton>
          : <span className="text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>Already moved to trials, or not paid yet</span>}
        loading={loading && players.length === 0}
        isEmpty={!loading && filtered.length === 0}
        emptyTitle="No players match"
        emptyDescription="Try a different filter or search."
      >
        <table className="admin-table">
          <thead>
            <tr>
              <th className="w-10">
                <input type="checkbox" className="h-4 w-4 accent-[var(--brand-blue)]" aria-label="Select all on this page" checked={allOnPage}
                  onChange={() => setSelected((s) => { const n = new Set(s); rows.forEach((r) => (allOnPage ? n.delete(r.id) : n.add(r.id))); return n; })} />
              </th>
              <th>Player</th>
              <th>City</th>
              <th>Payment</th>
              <th>Stage</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => {
              const s = statusOf(p);
              return (
                <tr key={p.id} className="cursor-pointer" onClick={() => setOpenId(p.id)}>
                  <td onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" className="h-4 w-4 accent-[var(--brand-blue)]" aria-label={`Select ${p.name}`} checked={selected.has(p.id)} onChange={() => toggle(p.id)} />
                  </td>
                  <td>
                    <div className="flex items-center gap-3">
                      <span className="admin-avatar">{p.name.split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase()}</span>
                      <span className="min-w-0">
                        <span className="block truncate font-semibold text-[var(--admin-ink)]">{p.name}</span>
                        <span className="admin-muted block">{p.phone}</span>
                      </span>
                    </div>
                  </td>
                  <td className="admin-muted">{p.city || '—'}</td>
                  <td><StatusBadge status={p.paid ? 'paid' : p.paymentStatus} /></td>
                  <td className="text-[var(--admin-ink)]">{STAGE_LABEL[p.stage]}</td>
                  <td><StatusBadge status={s.status} label={s.label} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between gap-3 border-t border-[var(--admin-line)] px-4 py-3">
            <span className="admin-muted text-sm">{current * PAGE_SIZE + 1}–{Math.min((current + 1) * PAGE_SIZE, filtered.length)} of {filtered.length.toLocaleString('en-IN')}</span>
            <div className="flex gap-2">
              <ActionButton variant="ghost" size="sm" icon={ChevronLeft} disabled={current === 0} onClick={() => setPage(current - 1)} aria-label="Previous page" />
              <ActionButton variant="ghost" size="sm" icon={ChevronRight} disabled={current >= pages - 1} onClick={() => setPage(current + 1)} aria-label="Next page" />
            </div>
          </div>
        )}
      </DataTableShell>

      <PlayerPanel player={open} onClose={() => setOpenId(null)} onChanged={reload} />
    </div>
  );
};

export default PlayersPipeline;

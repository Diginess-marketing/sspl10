import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { CalendarCheck, ArrowRight, RefreshCw, Calendar, Clock, MapPin, Users, AlertCircle, Trash2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { usePlayerWorkflow } from '@/hooks/usePlayerWorkflow';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ActionButton, ConfirmDialog, DataTableShell, DetailDrawer } from '@/components/admin/ui';
import type { TrialsSectionPlayer } from '@/types/workflow';

interface TrialsSectionTabProps {
  onRefresh: () => void;
}

const BATCH_PRESETS = ['Morning Batch', 'Afternoon Batch', 'Evening Batch', 'Batch A', 'Batch B'];

/** "Sat, 24 Sep 2026 · 09:00 · Venue · Batch" for the allocation drawer's summary line. */
const describeAllocation = (date: string, time: string, venue: string, batch: string) => {
  if (!date) return '';
  const day = new Date(`${date}T00:00:00`);
  const dayLabel = Number.isNaN(day.getTime())
    ? date
    : day.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  return [dayLabel, time, venue.trim(), batch.trim()].filter(Boolean).join(' · ');
};

const plural = (n: number) => `${n} player${n === 1 ? '' : 's'}`;

const TrialsSectionTab = ({ onRefresh }: TrialsSectionTabProps) => {
  const [players, setPlayers] = useState<TrialsSectionPlayer[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [processing, setProcessing] = useState(false);
  const [showAllocation, setShowAllocation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [removeIds, setRemoveIds] = useState<string[] | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pastVenues, setPastVenues] = useState<string[]>([]);

  const [allocationDate, setAllocationDate] = useState(new Date().toISOString().split('T')[0]);
  const [allocationTime, setAllocationTime] = useState('09:00');
  const [allocationVenue, setAllocationVenue] = useState('');
  const [allocationBatch, setAllocationBatch] = useState('');

  const { user } = useAuth();
  const { getTrialsSectionPlayers, allocateToTrials, revertToRegistration, error } = usePlayerWorkflow();

  const today = new Date().toISOString().split('T')[0];
  const selectedPlayers = players.filter(p => selectedIds.has(p.workflow_id));
  const allocationSummary = describeAllocation(allocationDate, allocationTime, allocationVenue, allocationBatch);

  // Venues used in earlier allocations, offered as suggestions when the drawer opens.
  useEffect(() => {
    if (!showAllocation) return;
    supabase
      .from('trials_allocations')
      .select('allocation_venue')
      .not('allocation_venue', 'is', null)
      .order('created_at', { ascending: false })
      .limit(200)
      .then(({ data }) => {
        const venues = (data ?? []).map(row => row.allocation_venue?.trim()).filter((v): v is string => Boolean(v));
        setPastVenues([...new Set(venues)].slice(0, 20));
      });
  }, [showAllocation]);

  const loadPlayers = useCallback(async () => {
    setLoading(true);
    try {
      setPlayers(await getTrialsSectionPlayers());
    } finally {
      setLoading(false);
    }
  }, [getTrialsSectionPlayers]);

  useEffect(() => { loadPlayers(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = useMemo(() => {
    const s = searchTerm.trim().toLowerCase();
    if (!s) return players;
    return players.filter(p => p.full_name.toLowerCase().includes(s) || p.email.toLowerCase().includes(s) || p.phone.includes(s));
  }, [players, searchTerm]);

  const allSelected = filtered.length > 0 && filtered.every(p => selectedIds.has(p.workflow_id));
  const toggleAll = (checked: boolean) => setSelectedIds(checked ? new Set(filtered.map(p => p.workflow_id)) : new Set());
  const toggleOne = (id: string, checked: boolean) => {
    const next = new Set(selectedIds);
    if (checked) next.add(id); else next.delete(id);
    setSelectedIds(next);
  };

  const openAllocation = (ids: string[]) => {
    setSelectedIds(new Set(ids));
    setShowAllocation(true);
  };

  const handleAllocate = async () => {
    if (!allocationDate) return;
    setProcessing(true);
    try {
      const results = await allocateToTrials(
        Array.from(selectedIds), allocationDate, allocationTime || undefined,
        allocationVenue || undefined, allocationBatch || undefined, user?.id,
      );
      const ok = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success);
      if (failed.length) toast.error(`Allocated ${ok}; ${failed.length} failed`, { description: failed[0]?.message });
      else toast.success(`${plural(ok)} allocated to the trial`, { description: allocationSummary });
      setSelectedIds(new Set());
      setShowAllocation(false);
      loadPlayers();
      onRefresh();
    } catch (err: any) {
      toast.error('Could not allocate players', { description: err.message });
    } finally {
      setProcessing(false);
    }
  };

  const handleRemove = async () => {
    if (!removeIds) return;
    setProcessing(true);
    try {
      const results = await revertToRegistration(removeIds, user?.id);
      const ok = results.filter(r => r.success).length;
      const failed = results.length - ok;
      if (failed) toast.error(`Removed ${ok}; ${failed} failed`);
      else toast.success(`${plural(ok)} sent back to registrations`);
      setSelectedIds(new Set());
      setRemoveIds(null);
      loadPlayers();
      onRefresh();
    } catch (err: any) {
      toast.error('Could not remove players', { description: err.message });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div role="alert" className="flex items-center gap-3 rounded-2xl border border-[var(--admin-bad)]/30 bg-[var(--admin-bad-bg)] px-4 py-3 text-[var(--admin-bad)]">
          <AlertCircle className="h-5 w-5 shrink-0" /><span>{error}</span>
        </div>
      )}

      <DataTableShell
        title="Trials section"
        description="Paid players waiting to be allocated to a trial slot."
        search={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search name, email or phone"
        actions={<ActionButton variant="ghost" size="sm" icon={RefreshCw} onClick={loadPlayers} aria-label="Refresh" />}
        selectedCount={selectedIds.size}
        onClearSelection={() => setSelectedIds(new Set())}
        bulkActions={(
          <>
            <ActionButton variant="danger" size="sm" icon={Trash2} onClick={() => setRemoveIds(Array.from(selectedIds))}>Remove</ActionButton>
            <ActionButton variant="primary" size="sm" icon={CalendarCheck} onClick={() => setShowAllocation(true)}>Allocate</ActionButton>
          </>
        )}
        loading={loading}
        isEmpty={players.length === 0}
        emptyTitle="No players in the Trials Section"
        emptyDescription="Move paid players from the Registrations step to see them here."
      >
        <table className="admin-table">
          <thead>
            <tr>
              <th className="w-12"><Checkbox checked={allSelected} onCheckedChange={c => toggleAll(c === true)} aria-label="Select all" /></th>
              <th>Player</th>
              <th>Contact</th>
              <th>Location</th>
              <th>Position</th>
              <th>Paid</th>
              <th>Moved</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(player => (
              <tr key={player.workflow_id} data-selected={selectedIds.has(player.workflow_id)}>
                <td><Checkbox checked={selectedIds.has(player.workflow_id)} onCheckedChange={c => toggleOne(player.workflow_id, c === true)} aria-label={`Select ${player.full_name}`} /></td>
                <td>
                  <div className="flex items-center gap-3">
                    <span className="admin-avatar">{(player.full_name || '?').slice(0, 1).toUpperCase()}</span>
                    <span>
                      <span className="block font-semibold text-[var(--admin-ink)]">{player.full_name}</span>
                      <span className="admin-muted">Born {player.date_of_birth ? new Date(player.date_of_birth).toLocaleDateString() : 'N/A'}</span>
                    </span>
                  </div>
                </td>
                <td><span className="block">{player.email}</span><span className="admin-muted">{player.phone}</span></td>
                <td>{player.city && player.state ? `${player.city}, ${player.state}` : player.state || 'N/A'}</td>
                <td><span className="admin-badge admin-badge--info">{player.position}</span></td>
                <td><span className="admin-badge admin-badge--ok">₹{player.payment_amount || 0}</span></td>
                <td className="admin-muted">{player.moved_to_trials_at ? new Date(player.moved_to_trials_at).toLocaleDateString() : 'N/A'}</td>
                <td>
                  <div className="flex justify-end gap-2">
                    <ActionButton variant="outline" size="sm" icon={CalendarCheck} disabled={processing} onClick={() => openAllocation([player.workflow_id])}>Allocate</ActionButton>
                    <ActionButton variant="ghost" size="sm" icon={Trash2} disabled={processing} onClick={() => setRemoveIds([player.workflow_id])} aria-label={`Remove ${player.full_name}`} className="!text-[var(--admin-bad)]" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataTableShell>

      <ConfirmDialog
        open={removeIds !== null}
        onOpenChange={open => { if (!open) setRemoveIds(null); }}
        tone="danger"
        title="Remove from Trials Section?"
        description={`${plural(removeIds?.length ?? 0)} will go back to the Registrations list. Nothing is deleted.`}
        confirmLabel="Remove"
        loading={processing}
        onConfirm={handleRemove}
      />

      <DetailDrawer
        open={showAllocation}
        onOpenChange={setShowAllocation}
        eyebrow="Guided allocation"
        title="Allocate to trials"
        description={`Set the trial slot for ${plural(selectedIds.size)}.`}
        footer={(
          <>
            <ActionButton variant="ghost" onClick={() => setShowAllocation(false)} disabled={processing}>Cancel</ActionButton>
            <ActionButton variant="primary" icon={ArrowRight} loading={processing} disabled={!allocationDate || selectedIds.size === 0} onClick={handleAllocate}>
              Allocate {plural(selectedIds.size)}
            </ActionButton>
          </>
        )}
      >
        <div className="space-y-6">
          <div>
            <p className="admin-label"><Users className="h-4 w-4" />Players</p>
            <div className="flex flex-wrap gap-2">
              {selectedPlayers.slice(0, 8).map(p => <span key={p.workflow_id} className="admin-badge admin-badge--info before:hidden">{p.full_name}</span>)}
              {selectedPlayers.length > 8 && <span className="admin-badge admin-badge--neutral before:hidden">+{selectedPlayers.length - 8} more</span>}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="alloc-date" className="admin-label"><Calendar className="h-4 w-4" />Trial date *</label>
              <input id="alloc-date" type="date" min={today} value={allocationDate} onChange={e => setAllocationDate(e.target.value)} className="admin-field" required />
            </div>
            <div>
              <label htmlFor="alloc-time" className="admin-label"><Clock className="h-4 w-4" />Reporting time</label>
              <input id="alloc-time" type="time" value={allocationTime} onChange={e => setAllocationTime(e.target.value)} className="admin-field" />
            </div>
          </div>

          <div>
            <label htmlFor="alloc-venue" className="admin-label"><MapPin className="h-4 w-4" />Venue</label>
            <input id="alloc-venue" list="trial-venue-options" placeholder="Ground name and city" value={allocationVenue} onChange={e => setAllocationVenue(e.target.value)} className="admin-field" />
            <datalist id="trial-venue-options">{pastVenues.map(v => <option key={v} value={v} />)}</datalist>
            {pastVenues.length > 0 && <p className="admin-muted mt-2">Start typing to reuse a venue from earlier allocations.</p>}
          </div>

          <div>
            <label htmlFor="alloc-batch" className="admin-label"><Users className="h-4 w-4" />Batch</label>
            <input id="alloc-batch" placeholder="e.g. Batch A, Morning Batch" value={allocationBatch} onChange={e => setAllocationBatch(e.target.value)} className="admin-field" />
            <div className="mt-3 flex flex-wrap gap-2">
              {BATCH_PRESETS.map(preset => (
                <button key={preset} type="button" className="admin-chip" data-active={allocationBatch === preset} aria-pressed={allocationBatch === preset} onClick={() => setAllocationBatch(preset)}>{preset}</button>
              ))}
            </div>
          </div>

          <div className="admin-summary">
            <CalendarCheck className="mt-0.5 h-5 w-5 shrink-0 text-[var(--admin-accent)]" />
            <p><strong>{plural(selectedIds.size)}</strong> → {allocationSummary || 'choose a trial date'}</p>
          </div>
        </div>
      </DetailDrawer>
    </div>
  );
};

export default TrialsSectionTab;

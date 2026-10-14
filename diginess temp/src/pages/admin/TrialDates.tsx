import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { CalendarPlus, RefreshCw, Trash2, UserPlus, X, Smartphone } from 'lucide-react';
import { PageHeader, ActionButton, DataTableShell, DetailDrawer, ConfirmDialog, StatusBadge } from '@/components/admin/ui';
import { adminApi } from '@/lib/adminApi';

// Trial dates (PRD section 6): create dates and venues, see capacity and attendance, and
// assign selectors, who then score on their phones at /selector.

interface TrialEvent {
  trial_id: string;
  trial_name: string | null;
  trial_date: string;
  trial_time: string | null;
  trial_venue: string | null;
  trial_address: string | null;
  trial_batch: string | null;
  trial_capacity: number | null;
  google_map_link: string | null;
  venue: string;
  booked: number;
  attended: number;
  selectors: string[] | null;
}
interface Selector { id: string; full_name: string; email: string; city_state: string | null; preferred_region: string | null }

const EMPTY = { trial_name: '', trial_date: '', trial_time: '09:00', trial_venue: '', trial_address: '', trial_batch: '', trial_capacity: '', google_map_link: '' };
const fmt = (d: string) => new Date(`${d}T00:00:00`).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
const today = () => new Date().toISOString().slice(0, 10);

const TrialDates = () => {
  const [rows, setRows] = useState<TrialEvent[]>([]);
  const [selectorsReady, setSelectorsReady] = useState(true);
  const [selectors, setSelectors] = useState<Selector[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming');
  const [editing, setEditing] = useState<TrialEvent | 'new' | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<TrialEvent | null>(null);
  const [pickSelector, setPickSelector] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [res, sel] = await Promise.all([
        adminApi.get<{ data: TrialEvent[]; selectorsReady: boolean }>('/admin/trial-events'),
        adminApi.get<Selector[]>('/admin/trial-events/selectors').catch(() => []),
      ]);
      setRows(res.data);
      setSelectorsReady(res.selectorsReady);
      setSelectors(sel);
    } catch (err) {
      toast.error('Could not load trial dates', { description: (err as Error).message });
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const shown = useMemo(() => rows.filter((r) => (filter === 'upcoming' ? r.trial_date >= today() : filter === 'past' ? r.trial_date < today() : true))
    .sort((a, b) => (filter === 'past' ? b.trial_date.localeCompare(a.trial_date) : a.trial_date.localeCompare(b.trial_date))), [rows, filter]);
  const current = editing && editing !== 'new' ? rows.find((r) => r.trial_id === editing.trial_id) || editing : null;

  const openEdit = (t: TrialEvent | 'new') => {
    setEditing(t);
    setPickSelector('');
    setForm(t === 'new' ? EMPTY : {
      trial_name: t.trial_name || '', trial_date: t.trial_date, trial_time: (t.trial_time || '').slice(0, 5), trial_venue: t.trial_venue || '',
      trial_address: t.trial_address || '', trial_batch: t.trial_batch || '', trial_capacity: t.trial_capacity ? String(t.trial_capacity) : '', google_map_link: t.google_map_link || '',
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      const body = { ...form, trial_capacity: form.trial_capacity ? Number(form.trial_capacity) : null };
      if (editing === 'new') await adminApi.post('/admin/trial-events', body);
      else if (editing) await adminApi.put(`/admin/trial-events/${editing.trial_id}`, body);
      toast.success(editing === 'new' ? 'Trial date created' : 'Trial date saved');
      setEditing(null);
      load();
    } catch (err) {
      toast.error('Could not save', { description: (err as Error).message });
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!deleting) return;
    try {
      await adminApi.delete(`/admin/trial-events/${deleting.trial_id}`);
      toast.success('Trial date deleted', { description: 'It can be restored from Action history for 30 days.' });
      setDeleting(null);
      setEditing(null);
      load();
    } catch (err) {
      toast.error('Could not delete', { description: (err as Error).message });
    }
  };

  const assign = async () => {
    if (!current || !pickSelector) return;
    try {
      await adminApi.post(`/admin/trial-events/${current.trial_id}/selectors`, { selectorId: pickSelector });
      toast.success('Selector assigned', { description: 'They have been emailed the date, venue and scoring link.' });
      setPickSelector('');
      load();
    } catch (err) {
      toast.error('Could not assign', { description: (err as Error).message });
    }
  };

  const unassign = async (email: string) => {
    if (!current) return;
    try {
      await adminApi.delete(`/admin/trial-events/${current.trial_id}/selectors/${encodeURIComponent(email)}`);
      toast.success('Selector removed');
      load();
    } catch (err) {
      toast.error('Could not remove', { description: (err as Error).message });
    }
  };

  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Players & Trials"
        title={<>Trial <em>dates</em></>}
        description="Create trial dates and venues, watch capacity, and assign selectors who score on their phones."
        actions={(
          <>
            <ActionButton variant="ghost" icon={RefreshCw} loading={loading} onClick={load}>Refresh</ActionButton>
            <a href="/selector" target="_blank" rel="noopener noreferrer" className="admin-btn admin-btn--outline"><Smartphone className="h-4 w-4" />Scoring page</a>
            <ActionButton variant="primary" icon={CalendarPlus} onClick={() => openEdit('new')}>New trial date</ActionButton>
          </>
        )}
      />

      {!selectorsReady && (
        <p className="admin-card p-4 text-sm text-[var(--admin-ink)]">Selector assignment needs the pending database update (RUN_ONCE_IN_SQL_EDITOR.sql). Until then, admins can score any trial on the scoring page.</p>
      )}

      <DataTableShell
        title="Trial dates"
        description="Booked counts come from players allocated to each date and venue."
        filters={[{ value: 'upcoming', label: 'Upcoming' }, { value: 'past', label: 'Past' }, { value: 'all', label: 'All', count: rows.length }]}
        activeFilter={filter}
        onFilterChange={setFilter}
        loading={loading && rows.length === 0}
        isEmpty={!loading && shown.length === 0}
        emptyTitle={filter === 'upcoming' ? 'No upcoming trial dates' : 'No trial dates'}
        emptyDescription="Create one with New trial date."
      >
        <table className="admin-table">
          <thead><tr><th>Date</th><th>Venue</th><th className="text-right">Booked</th><th className="text-right">Capacity</th><th className="text-right">Attended</th><th>Selectors</th></tr></thead>
          <tbody>
            {shown.map((t) => {
              const full = t.trial_capacity !== null && t.booked >= t.trial_capacity;
              return (
                <tr key={t.trial_id} className="cursor-pointer" onClick={() => openEdit(t)}>
                  <td className="whitespace-nowrap">
                    <span className="block font-semibold text-[var(--admin-ink)]">{fmt(t.trial_date)}</span>
                    <span className="admin-muted text-sm">{[t.trial_time?.slice(0, 5), t.trial_batch].filter(Boolean).join(' · ')}</span>
                  </td>
                  <td className="max-w-[280px]">{t.venue}</td>
                  <td className="text-right tabular-nums">{t.booked}</td>
                  <td className="text-right tabular-nums">{t.trial_capacity ?? '—'}{full && <span className="ml-2"><StatusBadge status="failed" label="Full" /></span>}</td>
                  <td className="text-right tabular-nums">{t.attended}</td>
                  <td className="admin-muted text-sm">{t.selectors === null ? '—' : t.selectors.length ? t.selectors.join(', ') : 'None'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </DataTableShell>

      <DetailDrawer
        open={editing !== null}
        onOpenChange={(o) => { if (!o && !saving) setEditing(null); }}
        eyebrow={editing === 'new' ? 'New trial date' : 'Trial date'}
        title={editing === 'new' ? 'Create a trial date' : current ? `${fmt(current.trial_date)} · ${current.venue}` : ''}
        description={current ? `${current.booked} booked${current.trial_capacity ? ` of ${current.trial_capacity}` : ''} · ${current.attended} attended` : 'Players are allocated to it from Trials → Trials section.'}
        footer={(
          <>
            {current && <ActionButton variant="ghost" icon={Trash2} disabled={current.booked > 0} onClick={() => setDeleting(current)} className="!text-[var(--admin-bad)]">Delete</ActionButton>}
            <ActionButton variant="ghost" onClick={() => setEditing(null)} disabled={saving}>Cancel</ActionButton>
            <ActionButton variant="primary" loading={saving} disabled={!form.trial_date || !form.trial_venue} onClick={save}>Save</ActionButton>
          </>
        )}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label htmlFor="t-date" className="admin-label">Date</label><input id="t-date" type="date" className="admin-field" value={form.trial_date} onChange={set('trial_date')} /></div>
            <div><label htmlFor="t-time" className="admin-label">Time</label><input id="t-time" type="time" className="admin-field" value={form.trial_time} onChange={set('trial_time')} /></div>
          </div>
          <div><label htmlFor="t-venue" className="admin-label">Venue (include the city)</label><input id="t-venue" className="admin-field" value={form.trial_venue} onChange={set('trial_venue')} placeholder="e.g. YMCA Ground, Chennai" /></div>
          <div><label htmlFor="t-address" className="admin-label">Address</label><input id="t-address" className="admin-field" value={form.trial_address} onChange={set('trial_address')} placeholder="Street, area, city, state" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label htmlFor="t-batch" className="admin-label">Batch</label><input id="t-batch" className="admin-field" value={form.trial_batch} onChange={set('trial_batch')} placeholder="e.g. Morning" /></div>
            <div><label htmlFor="t-cap" className="admin-label">Capacity</label><input id="t-cap" type="number" min="1" className="admin-field" value={form.trial_capacity} onChange={set('trial_capacity')} /></div>
          </div>
          <div><label htmlFor="t-name" className="admin-label">Name (optional)</label><input id="t-name" className="admin-field" value={form.trial_name} onChange={set('trial_name')} /></div>
          <div><label htmlFor="t-map" className="admin-label">Google Maps link (optional)</label><input id="t-map" className="admin-field" value={form.google_map_link} onChange={set('google_map_link')} /></div>

          {current && current.selectors !== null && (
            <fieldset className="space-y-2 border-t border-[var(--admin-line)] pt-4">
              <legend className="admin-label">Selectors</legend>
              {current.selectors.length === 0 && <p className="admin-muted text-sm">No selectors assigned yet.</p>}
              {current.selectors.map((email) => (
                <div key={email} className="flex items-center justify-between rounded-xl bg-[var(--admin-bg)] px-3 py-2">
                  <span className="text-sm">{email}</span>
                  <ActionButton size="sm" variant="ghost" icon={X} aria-label={`Remove ${email}`} onClick={() => unassign(email)} />
                </div>
              ))}
              <div className="flex gap-2">
                <select aria-label="Selector to assign" className="admin-field" value={pickSelector} onChange={(e) => setPickSelector(e.target.value)}>
                  <option value="">{selectors.length ? 'Choose an approved selector…' : 'No approved selectors yet'}</option>
                  {selectors.filter((s) => !current.selectors?.includes(s.email.toLowerCase())).map((s) => (
                    <option key={s.id} value={s.id}>{s.full_name} · {s.preferred_region || s.city_state || s.email}</option>
                  ))}
                </select>
                <ActionButton variant="soft" icon={UserPlus} disabled={!pickSelector} onClick={assign}>Assign</ActionButton>
              </div>
            </fieldset>
          )}
        </div>
      </DetailDrawer>

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(o) => { if (!o) setDeleting(null); }}
        tone="danger"
        title="Delete this trial date?"
        description="Nobody is booked on it. It moves to the bin in Action history for 30 days."
        confirmLabel="Delete"
        onConfirm={remove}
      />
    </div>
  );
};

export default TrialDates;

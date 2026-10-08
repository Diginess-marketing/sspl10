import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import {
  CalendarCheck, RefreshCw, Calendar, MapPin, Users, CheckCircle, XCircle, Trophy, Edit, AlertCircle, Clock, Save, Wand2,
} from 'lucide-react';
import { usePlayerWorkflow } from '@/hooks/usePlayerWorkflow';
import { useAuth } from '@/hooks/useAuth';
import { ActionButton, ConfirmDialog, DataTableShell, DetailDrawer, StatCard, StatusBadge } from '@/components/admin/ui';
import type { TrialsAllocatedPlayer, AttendanceStatus, SelectionStatus } from '@/types/workflow';

interface TrialsAllocatedTabProps {
  onRefresh: () => void;
}

const DECISIONS: { value: SelectionStatus; label: string; icon: typeof Trophy; on: string }[] = [
  { value: 'selected', label: 'Selected', icon: Trophy, on: 'admin-btn--primary' },
  { value: 'waitlisted', label: 'Waitlisted', icon: Clock, on: 'admin-btn--soft' },
  { value: 'not_selected', label: 'Not selected', icon: XCircle, on: 'admin-btn--danger' },
  { value: 'pending', label: 'Pending', icon: Clock, on: 'admin-btn--outline' },
];

const norm = (v: string | null | undefined) => (v || 'pending').toLowerCase();

const TrialsAllocatedTab = ({ onRefresh }: TrialsAllocatedTabProps) => {
  const [players, setPlayers] = useState<TrialsAllocatedPlayer[]>([]);
  const [processing, setProcessing] = useState<string | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<TrialsAllocatedPlayer | null>(null);
  const [absentTarget, setAbsentTarget] = useState<TrialsAllocatedPlayer | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [attendanceFilter, setAttendanceFilter] = useState('all');

  // Results form state
  const [battingScore, setBattingScore] = useState('');
  const [bowlingScore, setBowlingScore] = useState('');
  const [fieldingScore, setFieldingScore] = useState('');
  const [overallScore, setOverallScore] = useState('');
  const [selectionStatus, setSelectionStatus] = useState<SelectionStatus>('pending');
  const [remarks, setRemarks] = useState('');
  const [evaluatorNotes, setEvaluatorNotes] = useState('');

  const { user } = useAuth();
  const { getTrialsAllocatedPlayers, markAttendance, updateTrialResults, error } = usePlayerWorkflow();

  const loadPlayers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTrialsAllocatedPlayers();
      // Sort: decision (selected first) > attendance (attended first) > name
      const decision: Record<string, number> = { selected: 1, pending: 2, waitlisted: 3, not_selected: 4, rejected: 4 };
      const attendance: Record<string, number> = { attended: 1, pending: 2, absent: 3 };
      setPlayers([...data].sort((a, b) =>
        (decision[norm(a.selection_status)] ?? 2) - (decision[norm(b.selection_status)] ?? 2)
        || (attendance[norm(a.attendance_status)] ?? 2) - (attendance[norm(b.attendance_status)] ?? 2)
        || a.full_name.localeCompare(b.full_name)));
    } finally {
      setLoading(false);
    }
  }, [getTrialsAllocatedPlayers]);

  useEffect(() => { loadPlayers(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const count = (status: string) => players.filter(p => norm(p.attendance_status) === status).length;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return players.filter(p =>
      (attendanceFilter === 'all' || norm(p.attendance_status) === attendanceFilter)
      && (!q || [p.full_name, p.email, p.phone].some(v => (v || '').toLowerCase().includes(q))));
  }, [players, search, attendanceFilter]);

  const chips = [
    { value: 'all', label: 'All', count: players.length },
    { value: 'pending', label: 'Pending', count: count('pending') },
    { value: 'attended', label: 'Attended', count: count('attended') },
    { value: 'absent', label: 'Absent', count: count('absent') },
  ];

  const handleMarkAttendance = async (player: TrialsAllocatedPlayer, status: AttendanceStatus) => {
    setProcessing(player.allocation_id);
    try {
      const ok = await markAttendance(player.allocation_id, status, user?.id);
      if (ok) {
        toast.success(`${player.full_name} marked ${status}`);
        setAbsentTarget(null);
        loadPlayers();
        onRefresh();
      } else {
        toast.error('Failed to update attendance');
      }
    } catch (err: any) {
      toast.error('Failed to update attendance', { description: err.message });
    } finally {
      setProcessing(null);
    }
  };

  const openResults = (player: TrialsAllocatedPlayer) => {
    setSelectedPlayer(player);
    setBattingScore('');
    setBowlingScore('');
    setFieldingScore('');
    setOverallScore(player.overall_score?.toString() || '');
    setSelectionStatus(player.selection_status || 'pending');
    setRemarks(player.remarks || '');
    setEvaluatorNotes('');
  };

  const suggestedOverall = useMemo(() => {
    const nums = [battingScore, bowlingScore, fieldingScore].map(parseFloat).filter(n => !Number.isNaN(n));
    return nums.length ? (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1) : '';
  }, [battingScore, bowlingScore, fieldingScore]);

  // Scores are 0-100; the server rejects anything else
  const scoreError = (v: string) => {
    if (v.trim() === '') return null;
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 && n <= 100 ? null : 'Enter a score from 0 to 100';
  };
  const invalidScores = [battingScore, bowlingScore, fieldingScore, overallScore].some((v) => scoreError(v));

  const handleSaveResults = async () => {
    if (!selectedPlayer) return;
    if (invalidScores) { toast.error('Fix the scores first', { description: 'Every score must be from 0 to 100.' }); return; }
    setProcessing(selectedPlayer.allocation_id);
    try {
      const num = (v: string) => (v ? parseFloat(v) : undefined);
      const ok = await updateTrialResults(
        selectedPlayer.allocation_id, num(battingScore), num(bowlingScore), num(fieldingScore), num(overallScore),
        selectionStatus, remarks || undefined, evaluatorNotes || undefined, user?.id,
      );
      if (ok) {
        toast.success('Trial results saved', { description: `${selectedPlayer.full_name}: ${selectionStatus.replace('_', ' ')}` });
        setSelectedPlayer(null);
        loadPlayers();
        onRefresh();
      } else {
        toast.error('Failed to save trial results');
      }
    } catch (err: any) {
      toast.error('Failed to save trial results', { description: err.message });
    } finally {
      setProcessing(null);
    }
  };

  const saving = processing === selectedPlayer?.allocation_id;
  const scoreFields = [
    { id: 'batting', label: 'Batting', value: battingScore, set: setBattingScore },
    { id: 'bowling', label: 'Bowling', value: bowlingScore, set: setBowlingScore },
    { id: 'fielding', label: 'Fielding', value: fieldingScore, set: setFieldingScore },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Allocated" value={players.length} icon={CalendarCheck} tone="blue" loading={loading} />
        <StatCard label="Attended" value={count('attended')} icon={CheckCircle} tone="green" loading={loading} />
        <StatCard label="Absent" value={count('absent')} icon={XCircle} tone="amber" loading={loading} />
        <StatCard label="Pending" value={count('pending')} icon={Clock} tone="lime" loading={loading} />
      </div>

      {error && (
        <div role="alert" className="flex items-center gap-3 rounded-2xl border border-[var(--admin-bad)]/30 bg-[var(--admin-bad-bg)] px-4 py-3 text-[var(--admin-bad)]">
          <AlertCircle className="h-5 w-5 shrink-0" /><span>{error}</span>
        </div>
      )}

      <DataTableShell
        title="Trials allocated"
        description="Mark attendance, then enter scores and the selection decision."
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search name, email or phone"
        filters={chips}
        activeFilter={attendanceFilter}
        onFilterChange={setAttendanceFilter}
        actions={<ActionButton variant="ghost" size="sm" icon={RefreshCw} onClick={loadPlayers} aria-label="Refresh" />}
        loading={loading}
        isEmpty={filtered.length === 0}
        emptyTitle={players.length === 0 ? 'No trials allocated yet' : 'No players match'}
        emptyDescription={players.length === 0 ? 'Allocate players from the Trials Section step.' : 'Try a different filter.'}
      >
        <table className="admin-table">
          <thead>
            <tr>
              <th>Player</th>
              <th>Position</th>
              <th>Trial</th>
              <th>Attendance</th>
              <th>Score</th>
              <th>Decision</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(player => {
              const busy = processing === player.allocation_id;
              const attendance = norm(player.attendance_status);
              return (
                <tr key={player.workflow_id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <span className="admin-avatar">{(player.full_name || '?').slice(0, 1).toUpperCase()}</span>
                      <span>
                        <span className="block font-semibold text-[var(--admin-ink)]">{player.full_name}</span>
                        <span className="admin-muted">{player.email}</span>
                      </span>
                    </div>
                  </td>
                  <td><span className="admin-badge admin-badge--info before:hidden">{player.position}</span></td>
                  <td>
                    <span className="admin-muted flex items-center gap-1.5"><Calendar className="h-4 w-4" />{player.allocation_date ? new Date(player.allocation_date).toLocaleDateString() : 'N/A'}{player.allocation_time ? ` · ${player.allocation_time}` : ''}</span>
                    {player.allocation_venue && <span className="admin-muted flex items-center gap-1.5"><MapPin className="h-4 w-4" />{player.allocation_venue}</span>}
                    {player.allocation_batch && <span className="admin-muted flex items-center gap-1.5"><Users className="h-4 w-4" />{player.allocation_batch}</span>}
                  </td>
                  <td><StatusBadge status={attendance} /></td>
                  <td>{player.overall_score !== null ? <span className="admin-num !text-[length:var(--brand-fs-h3)]">{player.overall_score}</span> : <span className="admin-muted">-</span>}</td>
                  <td>
                    <StatusBadge status={norm(player.selection_status)} />
                    {player.remarks && <span className="admin-muted mt-1 block max-w-40 truncate" title={player.remarks}>{player.remarks}</span>}
                  </td>
                  <td>
                    <div className="flex justify-end gap-2">
                      {attendance === 'pending' && (
                        <>
                          <ActionButton variant="soft" size="sm" icon={CheckCircle} disabled={busy} onClick={() => handleMarkAttendance(player, 'attended')}>Present</ActionButton>
                          <ActionButton variant="ghost" size="sm" icon={XCircle} disabled={busy} onClick={() => setAbsentTarget(player)} className="!text-[var(--admin-bad)]">Absent</ActionButton>
                        </>
                      )}
                      {attendance === 'attended' && (
                        <ActionButton variant={norm(player.selection_status) === 'pending' ? 'primary' : 'outline'} size="sm" icon={Edit} disabled={busy} onClick={() => openResults(player)}>
                          {norm(player.selection_status) === 'pending' ? 'Enter results' : 'Edit results'}
                        </ActionButton>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </DataTableShell>

      <ConfirmDialog
        open={absentTarget !== null}
        onOpenChange={open => { if (!open) setAbsentTarget(null); }}
        tone="danger"
        title="Mark as absent?"
        description={`${absentTarget?.full_name ?? 'This player'} will be recorded as absent for the trial.`}
        confirmLabel="Mark absent"
        loading={processing === absentTarget?.allocation_id}
        onConfirm={() => absentTarget ? handleMarkAttendance(absentTarget, 'absent') : undefined}
      />

      <DetailDrawer
        open={selectedPlayer !== null}
        onOpenChange={open => { if (!open) setSelectedPlayer(null); }}
        eyebrow="Trial results"
        title={selectedPlayer?.full_name || ''}
        description="Enter scores and the selection decision."
        footer={(
          <>
            <ActionButton variant="ghost" onClick={() => setSelectedPlayer(null)} disabled={saving}>Cancel</ActionButton>
            <ActionButton variant="primary" icon={Save} loading={saving} disabled={invalidScores} onClick={handleSaveResults}>Save results</ActionButton>
          </>
        )}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-3">
            {scoreFields.map(f => (
              <div key={f.id}>
                <label htmlFor={f.id} className="admin-label">{f.label}</label>
                <input id={f.id} type="number" min="0" max="100" step="0.5" placeholder="0-100" value={f.value} onChange={e => f.set(e.target.value)} className="admin-field"
                  aria-invalid={Boolean(scoreError(f.value))} aria-describedby={scoreError(f.value) ? `${f.id}-error` : undefined}
                  style={scoreError(f.value) ? { borderColor: 'var(--admin-bad)' } : undefined} />
                {scoreError(f.value) && <p id={`${f.id}-error`} className="mt-1 text-xs" style={{ color: 'var(--admin-bad)' }}>{scoreError(f.value)}</p>}
              </div>
            ))}
          </div>

          <div>
            <label htmlFor="overall" className="admin-label">Overall score</label>
            <div className="flex gap-2">
              <input id="overall" type="number" min="0" max="100" step="0.5" placeholder="0-100" value={overallScore} onChange={e => setOverallScore(e.target.value)} className="admin-field"
                aria-invalid={Boolean(scoreError(overallScore))} aria-describedby={scoreError(overallScore) ? 'overall-error' : undefined}
                style={scoreError(overallScore) ? { borderColor: 'var(--admin-bad)' } : undefined} />
              <ActionButton variant="soft" icon={Wand2} disabled={!suggestedOverall} onClick={() => setOverallScore(suggestedOverall)} title="Use the average of the three scores">
                Average
              </ActionButton>
            </div>
            {scoreError(overallScore) && <p id="overall-error" className="mt-1 text-xs" style={{ color: 'var(--admin-bad)' }}>{scoreError(overallScore)}</p>}
          </div>

          <div>
            <p className="admin-label">Decision</p>
            <div className="grid grid-cols-2 gap-2">
              {DECISIONS.map(d => (
                <button
                  key={d.value}
                  type="button"
                  aria-pressed={selectionStatus === d.value}
                  onClick={() => setSelectionStatus(d.value)}
                  className={`admin-btn ${selectionStatus === d.value ? d.on : 'admin-btn--ghost !border-[var(--admin-line)]'}`}
                >
                  <d.icon className="h-4 w-4" />{d.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="remarks" className="admin-label">Remarks</label>
            <textarea id="remarks" rows={3} placeholder="Comments on the player's performance…" value={remarks} onChange={e => setRemarks(e.target.value)} className="admin-field !h-auto py-3" />
          </div>
          <div>
            <label htmlFor="notes" className="admin-label">Evaluator notes (internal)</label>
            <textarea id="notes" rows={2} placeholder="Internal notes for evaluators…" value={evaluatorNotes} onChange={e => setEvaluatorNotes(e.target.value)} className="admin-field !h-auto py-3" />
          </div>
        </div>
      </DetailDrawer>
    </div>
  );
};

export default TrialsAllocatedTab;

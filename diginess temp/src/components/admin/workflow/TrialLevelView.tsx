import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { Phone, MapPin, RefreshCw, Download, Users, PhoneCall, CheckCircle, Trophy } from 'lucide-react';
import { usePlayerWorkflow } from '@/hooks/usePlayerWorkflow';
import { ActionButton, ConfirmDialog, DataTableShell, StatCard, StatusBadge } from '@/components/admin/ui';
import type { TrialViewRecord } from '@/types/workflow';

interface TrialLevelViewProps {
  level: number;
  onRefresh?: () => void;
}

type Pending = { player: TrialViewRecord; result: 'selected' | 'rejected' };

export const TrialLevelView = ({ level, onRefresh }: TrialLevelViewProps) => {
  const [players, setPlayers] = useState<TrialViewRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCity, setFilterCity] = useState('all');
  const [filter, setFilter] = useState('all');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [pending, setPending] = useState<Pending | null>(null);

  const { getTrialLevelPlayers, markCandidateCalled, markCandidateAttendance, markCandidateResult, loading } = usePlayerWorkflow();

  const loadPlayers = useCallback(async () => {
    const data = await getTrialLevelPlayers(level);
    setPlayers(data);
  }, [getTrialLevelPlayers, level]);

  useEffect(() => {
    loadPlayers();
  }, [loadPlayers]);

  const run = async (candidateId: string, action: () => Promise<boolean>, okMsg: string) => {
    setProcessingId(candidateId);
    try {
      const success = await action();
      if (success) {
        toast.success(okMsg);
        // A result can move the player to the next level and out of this view.
        await loadPlayers();
        onRefresh?.();
      } else {
        toast.error('Update failed');
      }
    } catch (err: any) {
      toast.error('Update failed', { description: err?.message });
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggleCalled = (p: TrialViewRecord) =>
    run(p.id, () => markCandidateCalled(p.id, level), `${p.name} call status updated`);

  const handleAttendanceChange = (p: TrialViewRecord, status: string) =>
    run(p.id, () => markCandidateAttendance(p.id, level, status), `${p.name} marked ${status}`);

  const handleResultChange = (p: TrialViewRecord, result: string) => {
    if (result === 'selected' || result === 'rejected') {
      setPending({ player: p, result });
      return;
    }
    run(p.id, () => markCandidateResult(p.id, level, result), `${p.name} result reset`);
  };

  const confirmResult = async () => {
    if (!pending) return;
    const { player, result } = pending;
    await run(player.id, () => markCandidateResult(player.id, level, result), `${player.name} ${result}`);
    setPending(null);
  };


  const getCalledStatus = (p: TrialViewRecord) =>
    level === 1 ? p.l1_called : level === 2 ? p.l2_called : p.l3_called;

  const getAttendanceStatus = (p: TrialViewRecord) => {
    const status = level === 1 ? p.l1_attendance : level === 2 ? p.l2_attendance : p.l3_attendance;
    return status || 'pending';
  };

  const getResultStatus = (p: TrialViewRecord) => {
    let status = level === 1 ? p.l1_result : level === 2 ? p.l2_result : p.l3_result;

    // Apply dynamic business logic
    if (p.l3_result === 'SELECTED') {
      status = 'SELECTED';
    } else if (p.l1_result === 'REJECTED' || p.l2_result === 'REJECTED' || p.l3_result === 'REJECTED') {
      if (status !== 'SELECTED') status = 'REJECTED';
    } else if (p.l1_attendance === 'ABSENT' || p.l2_attendance === 'ABSENT' || p.l3_attendance === 'ABSENT') {
      if (!status || status === 'PENDING') status = 'PENDING';
    }

    return status || 'pending';
  };

  const att = (p: TrialViewRecord) => getAttendanceStatus(p).toLowerCase();
  const res = (p: TrialViewRecord) => getResultStatus(p).toLowerCase();

  const stats = useMemo(() => ({
    total: players.length,
    called: players.filter(p => getCalledStatus(p)).length,
    attended: players.filter(p => att(p) === 'attended').length,
    selected: players.filter(p => res(p) === 'selected').length,
    rejected: players.filter(p => res(p) === 'rejected').length,
  }), [players, level]); // eslint-disable-line react-hooks/exhaustive-deps

  const chips = [
    { value: 'all', label: 'All', count: stats.total },
    { value: 'called', label: 'Called', count: stats.called },
    { value: 'attended', label: 'Attended', count: stats.attended },
    { value: 'selected', label: 'Selected', count: stats.selected },
    { value: 'rejected', label: 'Rejected', count: stats.rejected },
  ];

  const filteredPlayers = players
    .filter(p => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = (p.name || '').toLowerCase().includes(q) || (p.phone || '').includes(searchQuery);
      const matchesCity = filterCity === 'all' || p.city === filterCity;
      const matchesChip =
        filter === 'all' ||
        (filter === 'called' && getCalledStatus(p)) ||
        (filter === 'attended' && att(p) === 'attended') ||
        (filter === 'selected' && res(p) === 'selected') ||
        (filter === 'rejected' && res(p) === 'rejected');
      return matchesSearch && matchesCity && matchesChip;
    })
    .sort((a, b) => {
      // 1. Result (Selected > Pending > Rejected)
      const resPriority: Record<string, number> = { selected: 1, pending: 2, rejected: 3, not_selected: 3 };
      const d1 = (resPriority[res(a)] || 2) - (resPriority[res(b)] || 2);
      if (d1) return d1;
      // 2. Attendance (Attended > Pending > Absent)
      const attPriority: Record<string, number> = { attended: 1, pending: 2, absent: 3 };
      const d2 = (attPriority[att(a)] || 2) - (attPriority[att(b)] || 2);
      if (d2) return d2;
      // 3. Called first, then name
      const d3 = (getCalledStatus(a) ? 1 : 2) - (getCalledStatus(b) ? 1 : 2);
      if (d3) return d3;
      return a.name.localeCompare(b.name);
    });

  const uniqueCities = Array.from(new Set(players.map(p => p.city).filter(Boolean))).sort() as string[];

  const exportToCSV = () => {
    const headers = ['Name', 'Phone', 'Email', 'City', 'Called', 'Attendance', 'Result'];
    const rows = filteredPlayers.map(p => [
      p.name, p.phone, p.email, p.city || '', getCalledStatus(p) ? 'Yes' : 'No', getAttendanceStatus(p), getResultStatus(p),
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.map(cell => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `sspl_trials_l${level}_export.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label={`Level ${level} candidates`} value={stats.total} icon={Users} tone="blue" loading={loading && players.length === 0} />
        <StatCard label="Called" value={stats.called} icon={PhoneCall} tone="lime" loading={loading && players.length === 0} />
        <StatCard label="Attended" value={stats.attended} icon={CheckCircle} tone="green" loading={loading && players.length === 0} />
        <StatCard label="Selected" value={stats.selected} icon={Trophy} tone="amber" loading={loading && players.length === 0} />
      </div>

      <DataTableShell
        title={`Level ${level} management`}
        description={`Track calls, attendance and results for trial level ${level}.`}
        search={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search name or phone"
        filters={chips}
        activeFilter={filter}
        onFilterChange={setFilter}
        actions={(
          <>
            <select className="admin-select" aria-label="Filter by city" value={filterCity} onChange={e => setFilterCity(e.target.value)}>
              <option value="all">All cities</option>
              {uniqueCities.map(city => <option key={city} value={city}>{city}</option>)}
            </select>
            <ActionButton variant="soft" size="sm" icon={Download} onClick={exportToCSV}>Export</ActionButton>
            <ActionButton variant="ghost" size="sm" icon={RefreshCw} onClick={loadPlayers} loading={loading} aria-label="Refresh" />
          </>
        )}
        loading={loading && players.length === 0}
        isEmpty={filteredPlayers.length === 0}
        emptyTitle={players.length === 0 ? 'No candidates at this level' : 'No candidates match'}
        emptyDescription={players.length === 0 ? 'Sync paid players or select candidates at the previous level.' : 'Try a different filter.'}
      >
        <table className="admin-table">
          <thead>
            <tr>
              <th>Candidate</th>
              <th>Contact</th>
              <th>Location</th>
              <th>Remarks</th>
              <th className="text-center">Called</th>
              <th>Attendance</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            {filteredPlayers.map(player => {
              const isCalled = !!getCalledStatus(player);
              const attendance = att(player);
              const result = res(player);
              const busy = processingId === player.id;
              return (
                <tr key={player.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <span className="admin-avatar">{(player.name || '?').slice(0, 1).toUpperCase()}</span>
                      <span>
                        <span className="block font-semibold text-[var(--admin-ink)]">{player.name}</span>
                        <span className="admin-muted">{player.id.split('-')[0]}</span>
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="flex items-center gap-1.5 text-[var(--admin-ink)]"><Phone className="h-4 w-4" />{player.phone}</span>
                    <span className="admin-muted block max-w-48 truncate">{player.email}</span>
                  </td>
                  <td><span className="admin-muted flex items-center gap-1.5"><MapPin className="h-4 w-4" />{player.city || 'N/A'}</span></td>
                  <td><span className="admin-muted block max-w-40 truncate">{player.metadata?.excel_remarks || player.remarks || '-'}</span></td>
                  <td className="text-center">
                    <input
                      type="checkbox"
                      className="h-5 w-5 accent-[var(--brand-blue)]"
                      aria-label={`Called: ${player.name}`}
                      checked={isCalled}
                      disabled={busy}
                      onChange={() => handleToggleCalled(player)}
                    />
                  </td>
                  <td>
                    <div className="flex flex-col items-start gap-1.5">
                      <StatusBadge status={attendance} />
                      <select
                        className="admin-select"
                        aria-label={`Attendance: ${player.name}`}
                        value={attendance}
                        disabled={!isCalled || busy}
                        onChange={e => handleAttendanceChange(player, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="attended">Attended</option>
                        <option value="absent">Absent</option>
                      </select>
                    </div>
                  </td>
                  <td>
                    <div className="flex flex-col items-start gap-1.5">
                      <StatusBadge status={result} />
                      <select
                        className="admin-select"
                        aria-label={`Result: ${player.name}`}
                        value={result === 'not_selected' ? 'rejected' : result}
                        disabled={attendance !== 'attended' || busy}
                        onChange={e => handleResultChange(player, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="selected">Selected</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </DataTableShell>

      <ConfirmDialog
        open={pending !== null}
        onOpenChange={open => { if (!open) setPending(null); }}
        tone={pending?.result === 'rejected' ? 'danger' : 'default'}
        title={pending?.result === 'selected' ? 'Select this candidate?' : 'Reject this candidate?'}
        description={pending?.result === 'selected'
          ? `${pending?.player.name ?? 'This candidate'} will be selected${level < 3 ? ` and moved to Level ${level + 1}` : ' as a final selection'}.`
          : `${pending?.player.name ?? 'This candidate'} will be rejected at Level ${level}.`}
        confirmLabel={pending?.result === 'selected' ? 'Select' : 'Reject'}
        loading={processingId !== null && processingId === pending?.player.id}
        onConfirm={confirmResult}
      />
    </div>
  );
};

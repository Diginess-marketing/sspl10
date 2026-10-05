import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { Phone, MapPin, RefreshCw, Download, Users, PhoneCall, CheckCircle, Trophy, Mail, FileDown } from 'lucide-react';
import { usePlayerWorkflow } from '@/hooks/usePlayerWorkflow';
import { ActionButton, ConfirmDialog, DataTableShell, StatCard, StatusBadge } from '@/components/admin/ui';
import type { TrialLevelChangeResponse, TrialLevelEmail, TrialLevelState, TrialOutcome, TrialViewRecord } from '@/types/workflow';

const MAX_LEVEL = 5;

interface TrialLevelViewProps {
  level: number;
  onRefresh?: () => void;
}

// Changes that email the player go through a confirmation first
type Pending =
  | { player: TrialViewRecord; kind: 'result'; value: 'selected' | 'rejected' }
  | { player: TrialViewRecord; kind: 'attendance'; value: 'absent' };

const OUTCOME_LABEL: Record<TrialOutcome, string> = {
  selected: 'Selected',
  not_selected: 'Not selected',
  absent: 'Absent',
};

/** The outcome a level currently shows (what the player was / would be emailed about). */
function outcomeOf(state: TrialLevelState): TrialOutcome | null {
  const result = (state.result || '').toUpperCase();
  if (result === 'SELECTED') return 'selected';
  if (result === 'REJECTED') return 'not_selected';
  if ((state.attendance || '').toUpperCase() === 'ABSENT') return 'absent';
  return null;
}

export const TrialLevelView = ({ level, onRefresh }: TrialLevelViewProps) => {
  const [players, setPlayers] = useState<TrialViewRecord[]>([]);
  const [emails, setEmails] = useState<Map<string, TrialLevelEmail>>(new Map());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCity, setFilterCity] = useState('all');
  const [filter, setFilter] = useState('all');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [pending, setPending] = useState<Pending | null>(null);

  const {
    getTrialLevelPlayers, getLevelEmails, markCandidateCalled, markCandidateAttendance, markCandidateResult,
    resendLevelEmail, downloadLevelCertificate, loading,
  } = usePlayerWorkflow();

  const loadPlayers = useCallback(async () => {
    const [data, levelEmails] = await Promise.all([
      getTrialLevelPlayers(level),
      // The email table arrives with the migration; the tracker still works without it
      getLevelEmails(level).catch(() => [] as TrialLevelEmail[]),
    ]);
    setPlayers(data);
    setEmails(new Map(levelEmails.map((e) => [`${e.candidate_id}:${e.outcome}`, e])));
  }, [getTrialLevelPlayers, getLevelEmails, level]);

  useEffect(() => {
    loadPlayers();
  }, [loadPlayers]);

  const stateOf = (p: TrialViewRecord): TrialLevelState =>
    p.levels[level] ?? { called: false, attendance: null, result: null, marks: null, remarks: null };
  const att = (p: TrialViewRecord) => (stateOf(p).attendance || 'pending').toLowerCase();
  const res = (p: TrialViewRecord) => (stateOf(p).result || 'pending').toLowerCase();
  const emailOf = (p: TrialViewRecord) => {
    const outcome = outcomeOf(stateOf(p));
    return outcome ? emails.get(`${p.id}:${outcome}`) ?? null : null;
  };

  const reportNotification = (name: string, response: TrialLevelChangeResponse) => {
    const n = response.notification;
    if (!response.outcome || !n) return;
    const what = OUTCOME_LABEL[response.outcome].toLowerCase();
    if (n.status === 'sent') toast.success(`${what} email sent to ${name}${n.certificateNo ? ` with certificate ${n.certificateNo}` : ''}`);
    else if (n.status === 'failed') toast.error(`${what} email to ${name} failed`, { description: n.reason });
    else toast.message(`${what} email not sent to ${name}`, { description: n.reason });
  };

  const run = async (player: TrialViewRecord, action: () => Promise<TrialLevelChangeResponse>, okMsg: string) => {
    setProcessingId(player.id);
    try {
      const response = await action();
      toast.success(okMsg);
      reportNotification(player.name, response);
      // A result can move the player to the next level and out of this view.
      await loadPlayers();
      onRefresh?.();
    } catch (err: any) {
      toast.error('Update failed', { description: err?.message });
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggleCalled = (p: TrialViewRecord) =>
    run(p, () => markCandidateCalled(p.id, level, !stateOf(p).called), `${p.name} call status updated`);

  const handleAttendanceChange = (p: TrialViewRecord, status: string) => {
    if (status === 'absent') {
      setPending({ player: p, kind: 'attendance', value: 'absent' });
      return;
    }
    run(p, () => markCandidateAttendance(p.id, level, status), `${p.name} marked ${status}`);
  };

  const handleResultChange = (p: TrialViewRecord, result: string) => {
    if (result === 'selected' || result === 'rejected') {
      setPending({ player: p, kind: 'result', value: result });
      return;
    }
    run(p, () => markCandidateResult(p.id, level, result), `${p.name} result reset`);
  };

  const confirmPending = async () => {
    if (!pending) return;
    const { player } = pending;
    if (pending.kind === 'attendance') {
      await run(player, () => markCandidateAttendance(player.id, level, 'absent'), `${player.name} marked absent`);
    } else {
      await run(player, () => markCandidateResult(player.id, level, pending.value), `${player.name} ${pending.value}`);
    }
    setPending(null);
  };

  const handleResend = async (p: TrialViewRecord) => {
    setProcessingId(p.id);
    try {
      const r = await resendLevelEmail(p.id, level);
      if (r.status === 'sent') toast.success(`Email re-sent to ${p.name}`);
      else toast.error(`Email to ${p.name} ${r.status}`, { description: r.reason });
      await loadPlayers();
    } catch (err: any) {
      toast.error('Resend failed', { description: err?.message });
    } finally {
      setProcessingId(null);
    }
  };

  const handleCertificate = async (p: TrialViewRecord) => {
    try {
      await downloadLevelCertificate(p.id, level, p.name);
    } catch (err: any) {
      toast.error('Certificate download failed', { description: err?.message });
    }
  };

  const stats = useMemo(() => ({
    total: players.length,
    called: players.filter(p => stateOf(p).called).length,
    attended: players.filter(p => att(p) === 'attended').length,
    selected: players.filter(p => res(p) === 'selected').length,
    rejected: players.filter(p => res(p) === 'rejected').length,
    absent: players.filter(p => att(p) === 'absent').length,
  }), [players, level]); // eslint-disable-line react-hooks/exhaustive-deps

  const chips = [
    { value: 'all', label: 'All', count: stats.total },
    { value: 'called', label: 'Called', count: stats.called },
    { value: 'attended', label: 'Attended', count: stats.attended },
    { value: 'absent', label: 'Absent', count: stats.absent },
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
        (filter === 'called' && stateOf(p).called) ||
        (filter === 'attended' && att(p) === 'attended') ||
        (filter === 'absent' && att(p) === 'absent') ||
        (filter === 'selected' && res(p) === 'selected') ||
        (filter === 'rejected' && res(p) === 'rejected');
      return matchesSearch && matchesCity && matchesChip;
    })
    .sort((a, b) => {
      // 1. Result (Selected > Pending > Rejected)
      const resPriority: Record<string, number> = { selected: 1, pending: 2, rejected: 3 };
      const d1 = (resPriority[res(a)] || 2) - (resPriority[res(b)] || 2);
      if (d1) return d1;
      // 2. Attendance (Attended > Pending > Absent)
      const attPriority: Record<string, number> = { attended: 1, pending: 2, absent: 3 };
      const d2 = (attPriority[att(a)] || 2) - (attPriority[att(b)] || 2);
      if (d2) return d2;
      // 3. Called first, then name
      const d3 = (stateOf(a).called ? 1 : 2) - (stateOf(b).called ? 1 : 2);
      if (d3) return d3;
      return a.name.localeCompare(b.name);
    });

  const uniqueCities = Array.from(new Set(players.map(p => p.city).filter(Boolean))).sort() as string[];

  const exportToCSV = () => {
    const headers = ['Name', 'Phone', 'Email', 'City', 'Called', 'Attendance', 'Result', 'Marks', 'Remarks', 'Email status'];
    const rows = filteredPlayers.map(p => {
      const s = stateOf(p);
      return [
        p.name, p.phone, p.email || '', p.city || '', s.called ? 'Yes' : 'No', att(p), res(p),
        s.marks ?? '', s.remarks || '', emailOf(p)?.status || '',
      ];
    });
    const csvContent = [headers.join(','), ...rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))].join('\n');
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

  const pendingCopy = (() => {
    if (!pending) return { title: '', description: '', confirm: '' };
    const name = pending.player.name || 'This candidate';
    const to = pending.player.email;
    const mailNote = (attachment: string) =>
      to ? ` The player is emailed at ${to}${attachment}.` : ' No email address is on file, so no email is sent.';
    if (pending.kind === 'attendance') {
      return { title: 'Mark as absent?', description: `${name} will be marked absent at Level ${level}.${mailNote('')}`, confirm: 'Mark absent' };
    }
    if (pending.value === 'selected') {
      const next = level < MAX_LEVEL ? ` and moved to Level ${level + 1}` : ' as a final selection';
      return {
        title: 'Select this candidate?',
        description: `${name} will be selected${next}.${mailNote(` with the Level ${level} achievement certificate`)}`,
        confirm: 'Select',
      };
    }
    return {
      title: 'Mark as not selected?',
      description: `${name} will not continue past Level ${level}.${mailNote(` with the Level ${level} participation certificate`)}`,
      confirm: 'Not selected',
    };
  })();

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
        description={`Track calls, attendance and results for trial level ${level}. Results and absences email the player automatically.`}
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
        emptyDescription={players.length === 0
          ? (level === 1 ? 'Sync paid players to add candidates.' : `Candidates appear here once selected at Level ${level - 1}.`)
          : 'Try a different filter.'}
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
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {filteredPlayers.map(player => {
              const state = stateOf(player);
              const attendance = att(player);
              const result = res(player);
              const busy = processingId === player.id;
              const email = emailOf(player);
              const outcome = outcomeOf(state);
              const hasCertificate = outcome === 'selected' || outcome === 'not_selected';
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
                    <span className="admin-muted block max-w-48 truncate">{player.email || 'No email'}</span>
                  </td>
                  <td><span className="admin-muted flex items-center gap-1.5"><MapPin className="h-4 w-4" />{player.city || 'N/A'}</span></td>
                  <td>
                    <span className="admin-muted block max-w-40 truncate" title={state.remarks || undefined}>
                      {state.remarks || (level === 1 ? player.metadata?.excel_remarks : null) || '-'}
                    </span>
                  </td>
                  <td className="text-center">
                    <input
                      type="checkbox"
                      className="h-5 w-5 accent-[var(--brand-blue)]"
                      aria-label={`Called: ${player.name}`}
                      checked={state.called}
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
                        disabled={!state.called || busy}
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
                        value={result}
                        disabled={attendance !== 'attended' || busy}
                        onChange={e => handleResultChange(player, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="selected">Selected</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </td>
                  <td>
                    {outcome ? (
                      <div className="flex flex-col items-start gap-1.5">
                        <span title={email?.error || (email?.sent_at ? new Date(email.sent_at).toLocaleString() : undefined)}>
                          <StatusBadge status={email?.status ?? 'not_emailed'} />
                        </span>
                        <div className="flex gap-1">
                          <ActionButton
                            variant="ghost"
                            size="sm"
                            icon={Mail}
                            disabled={busy || !player.email}
                            onClick={() => handleResend(player)}
                            aria-label={`${email ? 'Resend' : 'Send'} ${OUTCOME_LABEL[outcome].toLowerCase()} email to ${player.name}`}
                          />
                          {hasCertificate && (
                            <ActionButton
                              variant="ghost"
                              size="sm"
                              icon={FileDown}
                              disabled={busy}
                              onClick={() => handleCertificate(player)}
                              aria-label={`Download Level ${level} certificate for ${player.name}`}
                            />
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="admin-muted">-</span>
                    )}
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
        tone={pending?.kind === 'result' && pending.value === 'selected' ? 'default' : 'danger'}
        title={pendingCopy.title}
        description={pendingCopy.description}
        confirmLabel={pendingCopy.confirm}
        loading={processingId !== null && processingId === pending?.player.id}
        onConfirm={confirmPending}
      />
    </div>
  );
};

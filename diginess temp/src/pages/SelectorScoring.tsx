import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ChevronLeft, Loader2, Search, Check, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { adminApi } from '@/lib/adminApi';
import { PageShell, Card, CardTitle, EmptyState, COLORS } from '@/components/league/PageShell';

// Selector scoring at the ground, on a phone (PRD feature 7). A selector signs in with the
// email on their application and sees only the trials assigned to them. Attendance and
// results follow the same rules as Admin > Trials (levels, certificates and emails).

interface Trial { trial_id: string; name: string | null; date: string; time: string | null; venue: string; batch: string | null; booked: number; attended: number; scored: number }
interface Player {
  allocationId: string;
  name: string;
  city: string | null;
  position: string | null;
  attendance: 'pending' | 'attended' | 'absent';
  batting: number | null;
  bowling: number | null;
  fielding: number | null;
  overall: number | null;
  decision: 'pending' | 'selected' | 'not_selected' | 'waitlisted';
  remarks: string | null;
}

const fmt = (d: string) => new Date(`${d}T00:00:00`).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
const btn = (bg: string, fg: string) => ({ background: bg, color: fg });

const ScoreInput = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <label className="block">
    <span className="block text-xs font-bold uppercase tracking-wide" style={{ color: COLORS.MUTED }}>{label}</span>
    <input type="number" inputMode="numeric" min="0" max="100" value={value} onChange={(e) => onChange(e.target.value)}
      className="mt-1 w-full rounded-xl border-2 px-3 py-3 text-lg font-bold" style={{ borderColor: '#cfd6ea', color: COLORS.NAVY }} />
  </label>
);

const PlayerCard = ({ p, onSaved }: { p: Player; onSaved: () => void }) => {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [scores, setScores] = useState({ batting: p.batting?.toString() ?? '', bowling: p.bowling?.toString() ?? '', fielding: p.fielding?.toString() ?? '', remarks: p.remarks ?? '' });
  const valid = ['batting', 'bowling', 'fielding'].every((k) => {
    const v = scores[k as 'batting'];
    return v === '' || (Number(v) >= 0 && Number(v) <= 100);
  });
  const average = (() => {
    const n = [scores.batting, scores.bowling, scores.fielding].filter((v) => v !== '').map(Number);
    return n.length ? Math.round((n.reduce((a, b) => a + b, 0) / n.length) * 10) / 10 : null;
  })();

  const mark = async (status: 'attended' | 'absent') => {
    setBusy(true);
    try {
      await adminApi.post(`/selector/allocations/${p.allocationId}/attendance`, { status });
      toast.success(`${p.name}: ${status}`);
      if (status === 'attended') setOpen(true);
      onSaved();
    } catch (err) {
      toast.error('Not saved', { description: (err as Error).message });
    } finally {
      setBusy(false);
    }
  };

  const decide = async (selectionStatus: 'selected' | 'not_selected' | 'pending') => {
    if (!valid) { toast.error('Scores must be from 0 to 100'); return; }
    setBusy(true);
    try {
      await adminApi.post(`/selector/allocations/${p.allocationId}/results`, {
        battingScore: scores.batting === '' ? undefined : Number(scores.batting),
        bowlingScore: scores.bowling === '' ? undefined : Number(scores.bowling),
        fieldingScore: scores.fielding === '' ? undefined : Number(scores.fielding),
        overallScore: average ?? undefined,
        selectionStatus,
        remarks: scores.remarks || undefined,
      });
      toast.success(selectionStatus === 'pending' ? `${p.name}: scores saved` : `${p.name}: ${selectionStatus === 'selected' ? 'selected' : 'not selected'}`);
      setOpen(false);
      onSaved();
    } catch (err) {
      toast.error('Not saved', { description: (err as Error).message });
    } finally {
      setBusy(false);
    }
  };

  const tone = p.decision === 'selected' ? '#1b7f3b' : p.decision === 'not_selected' || p.attendance === 'absent' ? '#b42318' : p.attendance === 'attended' ? '#d97706' : COLORS.MUTED;
  const status = p.decision === 'selected' ? 'Selected' : p.decision === 'not_selected' ? 'Not selected' : p.attendance === 'absent' ? 'Absent' : p.attendance === 'attended' ? 'Present · to score' : 'Not marked';

  return (
    <li className="rounded-2xl border bg-white p-4" style={{ borderColor: '#e1e6f2' }}>
      <button type="button" className="flex w-full items-center justify-between gap-3 text-left" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span>
          <span className="block text-base font-bold" style={{ color: COLORS.NAVY }}>{p.name}</span>
          <span className="text-sm" style={{ color: COLORS.MUTED }}>{[p.position, p.city].filter(Boolean).join(' · ')}</span>
        </span>
        <span className="shrink-0 text-xs font-bold uppercase" style={{ color: tone }}>{status}</span>
      </button>

      {p.attendance === 'pending' && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button type="button" disabled={busy} onClick={() => mark('attended')} className="flex items-center justify-center gap-2 rounded-xl py-3 font-bold" style={btn('#e6f4ea', '#1b7f3b')}><Check className="h-5 w-5" />Present</button>
          <button type="button" disabled={busy} onClick={() => mark('absent')} className="flex items-center justify-center gap-2 rounded-xl py-3 font-bold" style={btn('#fdecea', '#b42318')}><X className="h-5 w-5" />Absent</button>
        </div>
      )}

      {open && p.attendance === 'attended' && (
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <ScoreInput label="Batting" value={scores.batting} onChange={(v) => setScores({ ...scores, batting: v })} />
            <ScoreInput label="Bowling" value={scores.bowling} onChange={(v) => setScores({ ...scores, bowling: v })} />
            <ScoreInput label="Fielding" value={scores.fielding} onChange={(v) => setScores({ ...scores, fielding: v })} />
          </div>
          <p className="text-sm" style={{ color: COLORS.MUTED }}>Overall: <strong style={{ color: COLORS.NAVY }}>{average ?? '—'}</strong>{!valid && <span style={{ color: '#b42318' }}> · scores must be 0 to 100</span>}</p>
          <label className="block">
            <span className="block text-xs font-bold uppercase tracking-wide" style={{ color: COLORS.MUTED }}>Remarks</span>
            <input value={scores.remarks} onChange={(e) => setScores({ ...scores, remarks: e.target.value })} className="mt-1 w-full rounded-xl border-2 px-3 py-3" style={{ borderColor: '#cfd6ea', color: COLORS.NAVY }} />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" disabled={busy || !valid} onClick={() => decide('selected')} className="rounded-xl py-3 font-bold" style={btn(COLORS.LIME, COLORS.NAVY)}>Select</button>
            <button type="button" disabled={busy || !valid} onClick={() => decide('not_selected')} className="rounded-xl py-3 font-bold" style={btn('#fdecea', '#b42318')}>Not selected</button>
          </div>
          <button type="button" disabled={busy || !valid} onClick={() => decide('pending')} className="w-full rounded-xl border-2 py-2 text-sm font-bold" style={{ borderColor: '#cfd6ea', color: COLORS.NAVY }}>Save scores, decide later</button>
          {busy && <p className="flex items-center gap-2 text-sm" style={{ color: COLORS.MUTED }}><Loader2 className="h-4 w-4 animate-spin" />Saving…</p>}
        </div>
      )}
    </li>
  );
};

const SelectorScoring = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [trials, setTrials] = useState<Trial[] | null>(null);
  const [trial, setTrial] = useState<Trial | null>(null);
  const [players, setPlayers] = useState<Player[] | null>(null);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { if (!authLoading && !user) navigate('/auth?next=/selector', { replace: true }); }, [authLoading, user, navigate]);

  const loadTrials = useCallback(async () => {
    try {
      const res = await adminApi.get<{ trials: Trial[] }>('/selector/trials');
      setTrials(res.trials);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);
  useEffect(() => { if (user) loadTrials(); }, [user, loadTrials]);

  const loadPlayers = useCallback(async (t: Trial) => {
    try {
      const res = await adminApi.get<{ players: Player[] }>(`/selector/trials/${t.trial_id}/players`);
      setPlayers(res.players);
    } catch (err) {
      toast.error('Could not load players', { description: (err as Error).message });
    }
  }, []);

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (players || []).filter((p) => !q || p.name.toLowerCase().includes(q));
  }, [players, search]);
  const done = (players || []).filter((p) => p.decision !== 'pending' || p.attendance === 'absent').length;

  if (trial) {
    return (
      <PageShell eyebrow="Selector" title={fmt(trial.date)} intro={`${trial.venue}${trial.time ? ` · ${trial.time.slice(0, 5)}` : ''}`} path="/selector">
        <button type="button" onClick={() => { setTrial(null); setPlayers(null); loadTrials(); }} className="inline-flex items-center gap-1 font-bold" style={{ color: '#fff' }}>
          <ChevronLeft className="h-5 w-5" />All my trials
        </button>
        <Card>
          <p className="text-sm" style={{ color: COLORS.MUTED }}>{done} of {players?.length ?? '…'} players done</p>
          <label className="mt-2 flex items-center gap-2 rounded-xl border-2 px-3" style={{ borderColor: '#cfd6ea' }}>
            <Search className="h-5 w-5" style={{ color: COLORS.MUTED }} aria-hidden="true" />
            <span className="sr-only">Search players</span>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Find a player" className="w-full py-3 outline-none" style={{ color: COLORS.NAVY }} />
          </label>
        </Card>
        {!players ? <Card><p className="flex items-center gap-2" style={{ color: COLORS.MUTED }}><Loader2 className="h-4 w-4 animate-spin" />Loading players…</p></Card> : (
          <ul className="space-y-3">
            {shown.map((p) => <PlayerCard key={p.allocationId} p={p} onSaved={() => loadPlayers(trial)} />)}
            {shown.length === 0 && <Card><p style={{ color: COLORS.MUTED }}>No players {search ? 'match' : 'are booked on this trial'}.</p></Card>}
          </ul>
        )}
      </PageShell>
    );
  }

  return (
    <PageShell eyebrow="Selector" title="Trial scoring" intro="Mark attendance and enter scores at the ground. Results reach the player's level and emails automatically." path="/selector">
      {error && <Card><p role="alert" style={{ color: '#b42318' }}>{error}</p></Card>}
      {!trials && !error && <Card><p className="flex items-center gap-2" style={{ color: COLORS.MUTED }}><Loader2 className="h-4 w-4 animate-spin" />Loading your trials…</p></Card>}
      {trials && trials.length === 0 && (
        <EmptyState title="No trials assigned" text={`There are no trials assigned to ${user?.email}. Ask the SSPL team to assign you, and sign in with the email on your selector application.`} />
      )}
      {trials?.map((t) => (
        <Card key={t.trial_id}>
          <button type="button" className="w-full text-left" onClick={() => { setTrial(t); setSearch(''); loadPlayers(t); }}>
            <CardTitle>{fmt(t.date)}{t.time ? ` · ${t.time.slice(0, 5)}` : ''}</CardTitle>
            <p className="mt-1" style={{ color: COLORS.MUTED }}>{t.venue}{t.batch ? ` · ${t.batch}` : ''}</p>
            <p className="mt-2 text-sm font-semibold" style={{ color: COLORS.NAVY }}>{t.booked} booked · {t.attended} present · {t.scored} scored</p>
          </button>
        </Card>
      ))}
    </PageShell>
  );
};

export default SelectorScoring;

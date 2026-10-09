import { useCallback, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, Copy, Gift, Download, CheckCircle2, XCircle, Circle, CalendarDays, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { adminApi } from '@/lib/adminApi';
import { PageShell, Card, CardTitle, EmptyState, COLORS } from '@/components/league/PageShell';

// The player's own dashboard (PRD feature 10): status, next step, receipt, certificates and
// reward points. Registrations are matched to the email the player signed in with.

interface Level { level: number; called: boolean; attendance: string | null; result: 'selected' | 'not_selected' | null; certificate: string | null }
interface Registration {
  id: string;
  name: string;
  registeredAt: string;
  team: string | null;
  paymentStatus: string;
  paid: boolean;
  amount: number | null;
  paymentId: string | null;
  receipt: boolean;
  slot: { date: string | null; time: string | null; venue: string | null; batch: string | null } | null;
  onTracker: boolean;
  currentLevel: number | null;
  finalStatus: string | null;
  levels: Level[];
  nextStep: string;
}
interface Me { email: string; rewardPoints: number; referralCode: string | null; registrations: Registration[] }

const fmtDate = (d?: string | null) => (d ? new Date(`${d.slice(0, 10)}T00:00:00`).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' }) : '—');
const STATUS_TEXT: Record<string, string> = { captured: 'Paid', paid: 'Paid', completed: 'Paid', success: 'Paid', pending: 'Payment pending', failed: 'Payment failed', refunded: 'Refunded' };

const LevelRow = ({ l, current }: { l: Level; current: boolean }) => {
  const Icon = l.result === 'selected' ? CheckCircle2 : l.result === 'not_selected' || l.attendance === 'ABSENT' ? XCircle : Circle;
  const color = l.result === 'selected' ? '#1b7f3b' : l.result === 'not_selected' || l.attendance === 'ABSENT' ? '#b42318' : current ? '#d97706' : '#b8c0d4';
  const label = l.result === 'selected' ? 'Selected' : l.result === 'not_selected' ? 'Not selected' : l.attendance === 'ABSENT' ? 'Absent' : l.attendance === 'ATTENDED' ? 'Attended · result pending' : current ? 'Current level' : 'Not reached';
  return (
    <li className="flex items-center gap-3 py-2" aria-current={current ? 'step' : undefined}>
      <Icon className="h-5 w-5 shrink-0" style={{ color }} aria-hidden="true" />
      <span className="w-16 font-bold" style={{ color: COLORS.NAVY }}>Level {l.level}</span>
      <span className="flex-1 text-sm" style={{ color: COLORS.MUTED }}>{label}</span>
    </li>
  );
};

const UserDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [me, setMe] = useState<Me | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth', { replace: true });
  }, [authLoading, user, navigate]);

  const load = useCallback(async () => {
    try {
      setMe(await adminApi.get<Me>('/player/me'));
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);
  useEffect(() => { if (user) load(); }, [user, load]);

  const download = async (key: string, path: string, filename: string) => {
    setBusy(key);
    try {
      await adminApi.download(path, filename);
    } catch (err) {
      toast.error('Download failed', { description: (err as Error).message });
    } finally {
      setBusy(null);
    }
  };

  const paid = me?.registrations.filter((r) => r.paid || r.paymentStatus === 'refunded') || [];
  const unpaid = me?.registrations.filter((r) => !r.paid && r.paymentStatus !== 'refunded') || [];

  return (
    <PageShell eyebrow="My SSPL" title="Player dashboard" intro={me ? `Signed in as ${me.email}` : 'Your registration, trials and certificates.'} path="/dashboard">
      {error && <Card><p role="alert" style={{ color: '#b42318' }}>{error}</p></Card>}
      {!me && !error && <Card><p className="flex items-center gap-2" style={{ color: COLORS.MUTED }}><Loader2 className="h-4 w-4 animate-spin" />Loading your details…</p></Card>}

      {me && me.registrations.length === 0 && (
        <EmptyState
          title="No registration found"
          text={`We could not find a registration with ${me.email}. Sign in with the email you used when you registered, or register now.`}
          action={{ to: '/register', label: 'Register for trials' }}
        />
      )}

      {paid.map((r) => (
        <Card key={r.id}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>{r.name}</CardTitle>
              <p className="text-sm" style={{ color: COLORS.MUTED }}>
                Registered {fmtDate(r.registeredAt)}{r.team ? ` · Team ${r.team}` : ''}
              </p>
            </div>
            <span className="rounded-full px-3 py-1 text-xs font-bold uppercase" style={{ background: r.paid ? '#e6f4ea' : '#fff4e5', color: r.paid ? '#1b7f3b' : '#8a5300' }}>
              {STATUS_TEXT[r.paymentStatus] || r.paymentStatus}{r.amount ? ` · ₹${r.amount.toLocaleString('en-IN')}` : ''}
            </span>
          </div>

          <div className="mt-4 rounded-xl p-4" style={{ background: '#f2f6ff' }}>
            <p className="text-xs font-bold uppercase tracking-[0.15em]" style={{ color: COLORS.BLUE }}>Next step</p>
            <p className="mt-1 font-semibold" style={{ color: COLORS.NAVY }}>{r.nextStep}</p>
            {r.slot?.date && (
              <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm" style={{ color: COLORS.MUTED }}>
                <span className="inline-flex items-center gap-1"><CalendarDays className="h-4 w-4" aria-hidden="true" />{fmtDate(r.slot.date)}{r.slot.time ? ` · ${r.slot.time.slice(0, 5)}` : ''}</span>
                {r.slot.venue && <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" aria-hidden="true" />{r.slot.venue}{r.slot.batch ? ` · ${r.slot.batch}` : ''}</span>}
              </p>
            )}
          </div>

          {r.onTracker && (
            <div className="mt-4">
              <p className="text-xs font-bold uppercase tracking-[0.15em]" style={{ color: COLORS.MUTED }}>Trial levels</p>
              <ol className="mt-1 divide-y" style={{ borderColor: '#e6e9f2' }}>
                {r.levels.map((l) => <LevelRow key={l.level} l={l} current={!r.finalStatus || r.finalStatus === 'IN_PROGRESS' ? l.level === r.currentLevel : false} />)}
              </ol>
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            {r.receipt && (
              <button type="button" disabled={busy === `r-${r.id}`} onClick={() => download(`r-${r.id}`, `/player/me/receipt/${r.id}`, `SSPL-receipt-${r.paymentId}.pdf`)}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold" style={{ background: COLORS.NAVY, color: '#fff' }}>
                {busy === `r-${r.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" aria-hidden="true" />}Receipt
              </button>
            )}
            {r.levels.filter((l) => l.certificate).map((l) => (
              <button key={l.level} type="button" disabled={busy === `c-${r.id}-${l.level}`} onClick={() => download(`c-${r.id}-${l.level}`, `/player/me/certificate/${r.id}/${l.level}`, `SSPL-Level-${l.level}-certificate.pdf`)}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold" style={{ background: COLORS.LIME, color: COLORS.NAVY }}>
                {busy === `c-${r.id}-${l.level}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" aria-hidden="true" />}Level {l.level} certificate
              </button>
            ))}
          </div>
        </Card>
      ))}

      {unpaid.length > 0 && (
        <Card>
          <CardTitle>{paid.length ? 'Unfinished registrations' : 'Your registration'}</CardTitle>
          <p className="mt-2" style={{ color: COLORS.MUTED }}>
            {unpaid.length === 1 ? 'This registration is' : `${unpaid.length} registrations are`} waiting for payment.
            {paid.length ? ' You already have a paid registration above, so you can ignore these.' : ' Complete the payment to confirm your trial.'}
          </p>
          {!paid.length && <Link to="/register" className="mt-3 inline-block rounded-xl px-4 py-2 text-sm font-bold" style={{ background: COLORS.LIME, color: COLORS.NAVY }}>Complete registration</Link>}
        </Card>
      )}

      {me && (
        <Card>
          <div className="flex items-center gap-3">
            <Gift className="h-6 w-6" style={{ color: COLORS.BLUE }} aria-hidden="true" />
            <CardTitle>Reward points: {me.rewardPoints.toLocaleString('en-IN')}</CardTitle>
          </div>
          {me.referralCode && (
            <p className="mt-2 flex flex-wrap items-center gap-2" style={{ color: COLORS.MUTED }}>
              Your referral code: <strong className="font-mono" style={{ color: COLORS.NAVY }}>{me.referralCode}</strong>
              <button type="button" aria-label="Copy referral code" onClick={async () => {
                try { await navigator.clipboard.writeText(me.referralCode || ''); toast.success('Referral code copied'); } catch { toast.error('Could not copy'); }
              }}><Copy className="h-4 w-4" /></button>
            </p>
          )}
        </Card>
      )}
    </PageShell>
  );
};

export default UserDashboard;

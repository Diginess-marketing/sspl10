import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { UserCheck, UserX, CheckCircle2, XCircle, CalendarClock, Mail, ArrowRightLeft, Loader2, Download, Eraser } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { ActionButton, ConfirmDialog, StatusBadge } from '@/components/admin/ui';
import { usePlayerWorkflow } from '@/hooks/usePlayerWorkflow';
import { supabase } from '@/integrations/supabase/client';
import { adminApi } from '@/lib/adminApi';
import { fetchPlayerHistory, canMoveToTrials, type PipelinePlayer } from '@/hooks/usePlayerPipeline';

const STEPS = [
  { key: 'registered', label: 'Registered' },
  { key: 'trial', label: 'Trial' },
  { key: 'l4', label: 'L4' },
  { key: 'l5', label: 'L5' },
  { key: 'selected', label: 'Selected' },
] as const;

export const STAGE_LABEL: Record<PipelinePlayer['stage'], string> = {
  registered: 'Registered',
  trial: 'Trial (L1–L3)',
  l4: 'Level 4',
  l5: 'Level 5',
  selected: 'Selected',
  not_selected: 'Not selected',
  absent: 'Absent',
};

const fmtDate = (d?: string | null) => (d ? new Date(`${d.slice(0, 10)}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');
const fmtWhen = (d?: string | null) => (d ? new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : '');
const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?';

/** Index of the step the player has reached; where a journey ended (not selected / absent). */
function progress(p: PipelinePlayer): { reached: number; endedAt: number | null } {
  const levelStep = (lvl: number | null) => (!lvl || lvl <= 3 ? 1 : lvl === 4 ? 2 : 3);
  switch (p.stage) {
    case 'registered': return { reached: 0, endedAt: null };
    case 'trial': return { reached: 1, endedAt: null };
    case 'l4': return { reached: 2, endedAt: null };
    case 'l5': return { reached: 3, endedAt: null };
    case 'selected': return { reached: 4, endedAt: null };
    default: return { reached: levelStep(p.currentLevel), endedAt: levelStep(p.currentLevel) };
  }
}

const Stepper = ({ p }: { p: PipelinePlayer }) => {
  const { reached, endedAt } = progress(p);
  return (
    <ol className="flex flex-wrap items-center gap-x-2 gap-y-1" aria-label="Player journey">
      {STEPS.map((s, i) => {
        const ended = endedAt === i;
        const done = i < reached || (i === reached && p.stage === 'selected');
        const current = i === reached && !ended && p.stage !== 'selected';
        const color = ended ? 'var(--admin-bad)' : done ? '#1b7f3b' : current ? '#d97706' : 'var(--admin-line)';
        return (
          <li key={s.key} className="flex items-center gap-2">
            {i > 0 && <span className="h-px w-5" style={{ background: 'var(--admin-line)' }} aria-hidden="true" />}
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} aria-hidden="true" />
            <span className="admin-eyebrow !mb-0" style={{ color: done || current || ended ? 'var(--admin-ink)' : 'var(--admin-ink-soft)' }}
              aria-current={current ? 'step' : undefined}>
              {s.label}{ended ? (p.stage === 'absent' ? ' · absent' : ' · not selected') : ''}
            </span>
          </li>
        );
      })}
    </ol>
  );
};

type JourneyCard = { key: string; title: string; status: string; label: string; detail: string | null; current: boolean; dot: string; filled: boolean };

const word = (v?: string | null) => (v ? v.charAt(0).toUpperCase() + v.slice(1).toLowerCase() : '—');
const resultWord = (v?: string | null) => (!v ? '—' : v.toUpperCase() === 'REJECTED' ? 'Not selected' : word(v));

/** One card per journey stage (L1-L3 together, then L4, L5 and the final selection), as on the design. */
function journeyCards(p: PipelinePlayer): JourneyCard[] {
  const lvl = Math.min(Math.max(p.currentLevel ?? 1, 1), 5);
  const ended = p.stage === 'not_selected' || p.stage === 'absent';
  // The L1-L3 card shows the level the player is on (or reached last) within L1-L3
  const trialLevel = Math.min(lvl, 3);
  const stageOf = (level: number) => {
    const st = p.levels[level];
    const att = (st?.attendance || '').toUpperCase();
    const res = (st?.result || '').toUpperCase();
    const reached = p.candidateId && (level <= 3 ? true : lvl >= level);
    const isCurrent = Boolean(p.candidateId) && !ended && p.stage !== 'selected' && (level <= 3 ? lvl <= 3 : lvl === level);
    let status = 'not_reached'; let label = 'Not reached'; let dot = 'var(--admin-line)'; let filled = false;
    if (reached) {
      if (res === 'SELECTED') { status = 'selected'; label = 'Selected'; dot = '#1b7f3b'; filled = true; }
      else if (res === 'REJECTED') { status = 'not_selected'; label = 'Not selected'; dot = 'var(--admin-bad)'; filled = true; }
      else if (att === 'ABSENT') { status = 'absent'; label = 'Absent'; dot = 'var(--admin-bad)'; filled = true; }
      else if (att === 'ATTENDED') { status = 'attended'; label = 'Attended'; dot = '#d97706'; }
      else { status = 'pending'; label = 'Pending'; dot = '#d97706'; }
    }
    return { st, status, label, dot, filled, reached, isCurrent };
  };
  const trial = stageOf(trialLevel);
  const cards: JourneyCard[] = [{
    key: 'trial',
    title: 'Trial (L1–L3)',
    status: trial.status, label: trial.label, dot: trial.dot, filled: trial.filled,
    current: trial.isCurrent,
    detail: `${p.candidateId ? `Level ${trialLevel} · ` : ''}Attendance: ${word(trial.st?.attendance)} · Result: ${resultWord(trial.st?.result)}`,
  }];
  for (const level of [4, 5]) {
    const c = stageOf(level);
    cards.push({
      key: `l${level}`, title: `Level ${level}`, status: c.status, label: c.label, dot: c.dot, filled: c.filled, current: c.isCurrent,
      detail: `Attendance: ${c.reached ? word(c.st?.attendance) : '—'} · Result: ${c.reached ? resultWord(c.st?.result) : '—'}${c.reached && c.st?.marks !== null && c.st?.marks !== undefined ? ` · Marks: ${c.st.marks}` : ''}`,
    });
  }
  const done = p.stage === 'selected';
  cards.push({
    key: 'selected', title: 'Selected',
    status: done ? 'selected' : ended ? 'not_selected' : 'not_reached',
    label: done ? 'Selected' : ended ? (p.stage === 'absent' ? 'Ended · absent' : 'Ended · not selected') : 'Not reached',
    dot: done ? '#1b7f3b' : ended ? 'var(--admin-bad)' : 'var(--admin-line)', filled: done || ended,
    current: false,
    detail: done ? 'Cleared all five levels.' : ended ? `Journey ended at Level ${lvl}.` : null,
  });
  return cards;
}

const Field = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <>
    <dt>{label}</dt>
    <dd>{value || '—'}</dd>
  </>
);

type Pending = { kind: 'absent' } | { kind: 'select' } | { kind: 'reject' };
type Trial = { trial_id: string; trial_name: string; trial_date: string; trial_time: string | null; trial_venue: string | null; trial_batch: string | null };

export const PlayerPanel = ({ player, onClose, onChanged }: { player: PipelinePlayer | null; onClose: () => void; onChanged: () => void }) => {
  const [tab, setTab] = useState<'overview' | 'journey' | 'emails' | 'activity'>('overview');
  const [loaded, setLoaded] = useState<{ id: string; data: Awaited<ReturnType<typeof fetchPlayerHistory>> } | null>(null);
  const history = loaded && loaded.id === player?.id ? loaded.data : null;
  const [busy, setBusy] = useState<string | null>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  const [slotPicker, setSlotPicker] = useState<Trial[] | null>(null);
  const [slotChoice, setSlotChoice] = useState('');
  const { markCandidateAttendance, markCandidateResult, moveToTrialsSection, sendConfirmationEmail } = usePlayerWorkflow();
  // Privacy (PRD section 10): super admins can download or erase a player's data on request
  const { hasPermission } = useAuth();
  const [eraseOpen, setEraseOpen] = useState(false);
  const [eraseConfirm, setEraseConfirm] = useState('');
  const [eraseReason, setEraseReason] = useState('');

  useEffect(() => {
    let active = true;
    if (player) fetchPlayerHistory(player).then((h) => active && setLoaded({ id: player.id, data: h })).catch(() => active && setLoaded({ id: player.id, data: { emails: [], activity: [] } }));
    return () => { active = false; };
  }, [player]);

  if (!player) return null;
  const p = player;
  const level = Math.min(Math.max(p.currentLevel ?? 1, 1), 5);
  const state = p.levels[level];
  const finished = ['selected', 'not_selected', 'absent'].includes(p.stage);
  const firstName = p.name.split(/\s+/)[0];

  const run = async (key: string, action: () => Promise<unknown>, ok: string) => {
    setBusy(key);
    try {
      const r: any = await action();
      toast.success(ok);
      const n = r?.notification;
      if (n?.status === 'sent') toast.success(`Email sent to ${firstName}${n.certificateNo ? ` with certificate ${n.certificateNo}` : ''}`);
      else if (n?.status === 'failed') toast.error('Email could not be sent', { description: n.reason });
      onChanged();
    } catch (err: any) {
      toast.error('Not saved', { description: err?.message });
    } finally {
      setBusy(null);
      setPending(null);
    }
  };

  const addToTrials = () => run('add', async () => {
    const res = await moveToTrialsSection([p.id]);
    if (res[0] && !res[0].success) throw new Error(res[0].message);
    await adminApi.post('/admin/trials/sync-candidates', {});
  }, `${firstName} added to the trials`);

  const openSlotPicker = async () => {
    const { data, error } = await (supabase as any).from('trials').select('trial_id,trial_name,trial_date,trial_time,trial_venue,trial_batch').order('trial_date', { ascending: false });
    if (error) { toast.error('Could not load trials', { description: error.message }); return; }
    setSlotChoice(data?.[0]?.trial_id || '');
    setSlotPicker(data || []);
  };

  const saveSlot = () => run('slot', () => adminApi.post('/admin/workflow/slot', { registrationId: p.id, trialId: slotChoice }), 'Trial slot saved')
    .then(() => setSlotPicker(null));

  const confirmCopy = {
    absent: { title: `Mark ${firstName} absent?`, text: `Level ${level} is recorded as absent.${p.email ? ` ${firstName} is emailed at ${p.email}.` : ''}`, label: 'Mark absent', danger: true },
    select: { title: `Select ${firstName}?`, text: `${firstName} is selected at Level ${level}${level < 5 ? ` and moves to Level ${level + 1}` : ' as a final selection'}.${p.email ? ` The achievement certificate is emailed to ${p.email}.` : ''}`, label: 'Select', danger: false },
    reject: { title: `Mark ${firstName} not selected?`, text: `${firstName}'s journey ends at Level ${level}.${p.email ? ` The participation certificate is emailed to ${p.email}.` : ''}`, label: 'Not selected', danger: true },
  } as const;
  const confirm = pending ? confirmCopy[pending.kind] : null;

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="admin-shell flex w-full flex-col gap-0 overflow-y-auto bg-white p-0 sm:max-w-xl">
        {/* Header */}
        <div className="border-b border-[var(--admin-line)] bg-[var(--brand-sky-2)]/40 px-6 pb-4 pt-6">
          <div className="flex items-center gap-3">
            <span className="admin-avatar">{initials(p.name)}</span>
            <div className="min-w-0">
              <SheetTitle className="truncate text-base font-semibold text-[var(--admin-ink)]">{p.name}</SheetTitle>
              <p className="admin-muted truncate text-sm">{[p.city, p.state].filter(Boolean).join(', ')}{p.phone ? ` · ${p.phone}` : ''}</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="admin-eyebrow !mb-0">{STAGE_LABEL[p.stage]}</span>
            {p.slot && <StatusBadge status="trials_allocated" label="Allocated" />}
            <StatusBadge status={p.paid ? 'paid' : p.paymentStatus} />
            {p.confirmationSent && <StatusBadge status="sent" label="Confirmation sent" />}
          </div>
        </div>

        {/* Journey + actions */}
        <div className="space-y-4 border-b border-[var(--admin-line)] px-6 py-5">
          <Stepper p={p} />

          {p.stage !== 'registered' && canMoveToTrials(p) && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[var(--admin-bg)] px-3 py-2">
              <p className="text-sm text-[var(--admin-ink)]">Not yet moved to the trials section.</p>
              <ActionButton variant="soft" size="sm" icon={ArrowRightLeft} loading={busy === 'add'} onClick={addToTrials}>Move to trials</ActionButton>
            </div>
          )}

          {p.stage === 'registered' ? (
            <div className="space-y-3">
              <p className="text-sm text-[var(--admin-ink)]">{p.paid ? `${firstName} has paid and is waiting to be added to the trials.` : `${firstName} has not completed payment yet.`}</p>
              <div className="flex flex-wrap gap-2">
                <ActionButton variant="primary" size="sm" icon={ArrowRightLeft} disabled={!p.paid} loading={busy === 'add'} onClick={addToTrials}>Add to trials</ActionButton>
                {p.paid && <ActionButton variant="soft" size="sm" icon={Mail} loading={busy === 'mail'} onClick={() => run('mail', () => sendConfirmationEmail(p.id, p.name, p.email || '', p.amount || 0, p.paymentId || ''), 'Confirmation email sent')}>
                  {p.confirmationSent ? 'Resend confirmation' : 'Send confirmation'}
                </ActionButton>}
              </div>
            </div>
          ) : !p.candidateId ? (
            <div className="space-y-3">
              <p className="text-sm text-[var(--admin-ink)]">{firstName} is in the trials section but not yet on the L1–L5 tracker.</p>
              <ActionButton variant="primary" size="sm" icon={ArrowRightLeft} loading={busy === 'add'} onClick={addToTrials}>Add to trial levels</ActionButton>
            </div>
          ) : finished ? (
            <p className="text-sm text-[var(--admin-ink)]">
              {p.stage === 'selected' ? `${firstName} cleared all five levels.` : `${firstName}'s journey ended at Level ${level}${p.stage === 'absent' ? ' (absent)' : ''}.`} Change a level in the Journey tab if this was a mistake.
            </p>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-[var(--admin-ink)]">
                {p.slot?.date
                  ? <>Level {level}: scheduled for <strong>{fmtDate(p.slot.date)}</strong>{p.slot.venue ? <> at <strong>{p.slot.venue}</strong></> : null}. Did {firstName} turn up?</>
                  : <>Level {level}: no trial slot assigned yet. Did {firstName} turn up?</>}
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="text-center">
                  <ActionButton variant={(state.attendance || '').toUpperCase() === 'ATTENDED' ? 'primary' : 'soft'} className="w-full justify-center" icon={UserCheck}
                    loading={busy === 'att'} onClick={() => run('att', () => markCandidateAttendance(p.candidateId!, level, 'attended'), `${firstName} marked attended`)}>Attended</ActionButton>
                  <p className="admin-muted mt-1 text-xs">Then record the result</p>
                </div>
                <div className="text-center">
                  <ActionButton variant="outline" className="w-full justify-center" icon={UserX} onClick={() => setPending({ kind: 'absent' })}>Absent</ActionButton>
                  <p className="admin-muted mt-1 text-xs">Did not show up</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[var(--admin-line)] pt-3">
                <span className="admin-muted text-sm">Decide directly:</span>
                <ActionButton variant="ghost" size="sm" icon={CheckCircle2} onClick={() => setPending({ kind: 'select' })}>{level < 5 ? `Select → L${level + 1}` : 'Select (final)'}</ActionButton>
                <ActionButton variant="ghost" size="sm" icon={XCircle} onClick={() => setPending({ kind: 'reject' })}>Not selected</ActionButton>
              </div>
            </div>
          )}

          {p.stage !== 'registered' && p.paid && (
            <ActionButton variant="ghost" size="sm" icon={CalendarClock} onClick={openSlotPicker}>{p.slot ? 'Change slot' : 'Assign slot'}</ActionButton>
          )}
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 px-6 pt-4" role="tablist" aria-label="Player details">
          {(['overview', 'journey', 'emails', 'activity'] as const).map((t) => (
            <button key={t} type="button" role="tab" className="admin-chip" aria-selected={tab === t} data-active={tab === t} onClick={() => setTab(t)}>
              {t}{t === 'emails' && history ? ` ${history.emails.length}` : ''}
            </button>
          ))}
        </div>

        <div className="space-y-4 px-6 py-4">
          {tab === 'overview' && (
            <>
              <div className="admin-card p-5">
                <dl className="admin-kv">
                  <Field label="Date" value={p.slot ? fmtDate(p.slot.date) : 'No slot yet'} />
                  <Field label="Time" value={p.slot?.time} />
                  <Field label="Venue" value={p.slot?.venue} />
                  <Field label="Batch" value={p.slot?.batch} />
                </dl>
              </div>
              <div className="admin-card p-5">
                <dl className="admin-kv">
                  <Field label="Email" value={p.email} />
                  <Field label="Phone" value={p.phone} />
                  <Field label="Location" value={[p.city, p.state].filter(Boolean).join(', ')} />
                  <Field label="Role" value={p.position} />
                  <Field label="Date of birth" value={p.dob ? fmtDate(p.dob) : null} />
                  <Field label="Payment" value={`${p.paymentStatus}${p.amount ? ` · ₹${Number(p.amount).toLocaleString('en-IN')}` : ''}`} />
                  <Field label="Payment ID" value={p.paymentId} />
                  <Field label="Registered" value={p.registeredAt ? fmtDate(p.registeredAt) : null} />
                </dl>
              </div>
              {hasPermission('manage_staff') && (
                <div className="admin-card space-y-3 p-5">
                  <p className="admin-eyebrow !mb-0">Player data (privacy requests)</p>
                  <div className="flex flex-wrap gap-2">
                    <ActionButton size="sm" variant="outline" icon={Download}
                      onClick={() => adminApi.download(`/admin/privacy/registrations/${p.id}/export`, `sspl-player-data-${p.id}.json`).catch((err: Error) => toast.error('Download failed', { description: err.message }))}>
                      Download all data
                    </ActionButton>
                    <ActionButton size="sm" variant="ghost" icon={Eraser} className="!text-[var(--admin-bad)]" onClick={() => { setEraseOpen(true); setEraseConfirm(''); setEraseReason(''); }}>
                      Erase personal data
                    </ActionButton>
                  </div>
                </div>
              )}
            </>
          )}

          {tab === 'journey' && (
            <>
              <ol className="space-y-3" aria-label="Journey by stage">
                {journeyCards(p).map((c) => (
                  <li key={c.key} className="admin-card flex items-start gap-3 p-4" aria-current={c.current ? 'step' : undefined}
                    style={c.current ? { borderColor: 'var(--brand-blue)' } : undefined}>
                    <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2"
                      style={{ borderColor: c.dot, background: c.filled ? c.dot : 'transparent' }} aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-base font-bold uppercase tracking-wide text-[var(--admin-ink)]">{c.title}</span>
                        <StatusBadge status={c.status} label={c.label} />
                        {c.current && <span className="admin-eyebrow !mb-0">Current</span>}
                      </div>
                      {c.detail !== null && <p className="admin-muted mt-1 text-sm">{c.detail}</p>}
                    </div>
                  </li>
                ))}
              </ol>
              {!p.candidateId && <p className="admin-muted text-sm">Not on the L1–L5 tracker yet.</p>}
            </>
          )}

          {(tab === 'emails' || tab === 'activity') && (
            !history ? (
              <p className="admin-muted inline-flex items-center gap-2 text-sm"><Loader2 className="h-4 w-4 animate-spin" />Loading…</p>
            ) : (history[tab === 'emails' ? 'emails' : 'activity'].length === 0 ? (
              <p className="admin-muted text-sm">{tab === 'emails' ? 'No emails sent to this player yet.' : 'No recorded activity yet.'}</p>
            ) : (
              <ul className="admin-card divide-y divide-[var(--admin-line)]">
                {history[tab === 'emails' ? 'emails' : 'activity'].map((h: any, i: number) => (
                  <li key={i} className="flex items-start justify-between gap-3 px-5 py-3">
                    <div className="min-w-0">
                      <p className="font-semibold capitalize text-[var(--admin-ink)]">{h.what}</p>
                      {h.detail && <p className="admin-muted truncate text-sm">{h.detail}</p>}
                    </div>
                    <div className="shrink-0 text-right">
                      {h.status && <StatusBadge status={h.status === 'success' ? 'sent' : h.status} />}
                      <p className="admin-muted mt-1 text-xs">{fmtWhen(h.when)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ))
          )}
        </div>

        <ConfirmDialog
          open={pending !== null}
          onOpenChange={(o) => !o && setPending(null)}
          tone={confirm?.danger ? 'danger' : 'default'}
          title={confirm?.title || ''}
          description={confirm?.text || ''}
          confirmLabel={confirm?.label}
          loading={busy === 'decide'}
          onConfirm={() => {
            if (!pending) return;
            if (pending.kind === 'absent') run('decide', () => markCandidateAttendance(p.candidateId!, level, 'absent'), `${firstName} marked absent`);
            else run('decide', () => markCandidateResult(p.candidateId!, level, pending.kind === 'select' ? 'selected' : 'rejected'),
              pending.kind === 'select' ? `${firstName} selected at Level ${level}` : `${firstName} not selected at Level ${level}`);
          }}
        />

        <ConfirmDialog
          open={eraseOpen}
          onOpenChange={(o) => { if (!o && busy !== 'erase') setEraseOpen(false); }}
          tone="danger"
          title={`Erase ${firstName}'s personal data?`}
          description="Removes name, contact details, date of birth, school, photo and parent details from this registration and its linked trial records. Payments and results stay, without anything that identifies the person. This cannot be undone."
          confirmLabel="Erase"
          loading={busy === 'erase'}
          onConfirm={() => (eraseConfirm === 'ERASE' && eraseReason.trim().length >= 5
            ? run('erase', () => adminApi.post(`/admin/privacy/registrations/${p.id}/erase`, { confirm: eraseConfirm, reason: eraseReason }), 'Personal data erased').then(() => setEraseOpen(false))
            : undefined)}
        >
          <div className="mt-3 space-y-3">
            <div>
              <label htmlFor="erase-reason" className="admin-label">Reason (kept in the action history)</label>
              <input id="erase-reason" className="admin-field" value={eraseReason} onChange={(e) => setEraseReason(e.target.value)} placeholder="e.g. Player asked by email on 10 Oct 2026" />
            </div>
            <div>
              <label htmlFor="erase-confirm" className="admin-label">Type ERASE to confirm</label>
              <input id="erase-confirm" className="admin-field" value={eraseConfirm} onChange={(e) => setEraseConfirm(e.target.value)} />
            </div>
          </div>
        </ConfirmDialog>

        <ConfirmDialog
          open={slotPicker !== null}
          onOpenChange={(o) => !o && setSlotPicker(null)}
          title={p.slot ? 'Change trial slot' : 'Assign a trial slot'}
          description={slotPicker?.length ? `Choose the trial event for ${firstName}.` : 'No trial events exist yet. Create one in Trials first.'}
          confirmLabel="Save slot"
          loading={busy === 'slot'}
          onConfirm={() => (slotChoice ? saveSlot() : undefined)}
        >
          {slotPicker && slotPicker.length > 0 && (
            <select className="admin-field mt-2" aria-label="Trial event" value={slotChoice} onChange={(e) => setSlotChoice(e.target.value)}>
              {slotPicker.map((t) => (
                <option key={t.trial_id} value={t.trial_id}>
                  {fmtDate(t.trial_date)}{t.trial_time ? ` · ${t.trial_time}` : ''} · {t.trial_venue || t.trial_name}{t.trial_batch ? ` · ${t.trial_batch}` : ''}
                </option>
              ))}
            </select>
          )}
        </ConfirmDialog>
      </SheetContent>
    </Sheet>
  );
};

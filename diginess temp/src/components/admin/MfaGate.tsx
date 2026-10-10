import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ActionButton } from '@/components/admin/ui';

// Two-step sign-in for admins (PRD section 10: admin sign-in with a one-time code).
// An admin who has set up an authenticator app is asked for its 6-digit code before the admin
// panel opens. With VITE_REQUIRE_ADMIN_MFA=true every admin must set one up first.

const REQUIRED = import.meta.env.VITE_REQUIRE_ADMIN_MFA === 'true';

type State = { kind: 'loading' } | { kind: 'ok' } | { kind: 'verify'; factorId: string } | { kind: 'enroll' };

/** Set up an authenticator app: QR code, then the first code. Used here and on Admin > Security. */
export const MfaEnroll = ({ onDone }: { onDone: () => void }) => {
  const [enroll, setEnroll] = useState<{ id: string; qr: string; secret: string } | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const start = async () => {
    setBusy(true);
    setError(null);
    // Remove an unfinished earlier attempt so a fresh QR code can be issued
    const { data: factors } = await supabase.auth.mfa.listFactors();
    for (const f of factors?.all || []) if (f.status !== 'verified') await supabase.auth.mfa.unenroll({ factorId: f.id });
    const { data, error: err } = await supabase.auth.mfa.enroll({ factorType: 'totp', friendlyName: `SSPL admin ${new Date().toISOString().slice(0, 10)}` });
    setBusy(false);
    if (err || !data) { setError(err?.message || 'Could not start set-up'); return; }
    setEnroll({ id: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
  };

  const verify = async (e: FormEvent) => {
    e.preventDefault();
    if (!enroll) return;
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.auth.mfa.challengeAndVerify({ factorId: enroll.id, code: code.trim() });
    setBusy(false);
    if (err) { setError(err.message === 'Invalid TOTP code entered' ? 'That code is not right. Check the time on your phone and try the newest code.' : err.message); return; }
    onDone();
  };

  if (!enroll) {
    return (
      <div className="space-y-3">
        <p className="admin-muted">Use an authenticator app (Google Authenticator, Microsoft Authenticator, Authy…). You will scan a QR code once, then type a 6-digit code each time you sign in.</p>
        {error && <p role="alert" className="text-sm text-[var(--admin-bad)]">{error}</p>}
        <ActionButton variant="primary" icon={ShieldCheck} loading={busy} onClick={start}>Set up two-step sign-in</ActionButton>
      </div>
    );
  }
  return (
    <form onSubmit={verify} className="space-y-4">
      <p className="admin-muted">1. Scan this code with your authenticator app.</p>
      <img src={enroll.qr} alt="QR code for your authenticator app" className="mx-auto h-48 w-48 rounded-xl border border-[var(--admin-line)] bg-white p-2" />
      <p className="admin-muted text-sm">Can't scan? Enter this key in the app: <code className="break-all font-mono">{enroll.secret}</code></p>
      <label htmlFor="mfa-enroll-code" className="admin-label">2. Type the 6-digit code it shows</label>
      <input id="mfa-enroll-code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} className="admin-field text-center text-2xl tracking-[0.4em]"
        value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} />
      {error && <p role="alert" className="text-sm text-[var(--admin-bad)]">{error}</p>}
      <ActionButton type="submit" variant="primary" loading={busy} disabled={code.length !== 6}>Turn on</ActionButton>
    </form>
  );
};

const MfaGate = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<State>({ kind: 'loading' });
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const check = useCallback(async () => {
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal?.currentLevel === 'aal2') { setState({ kind: 'ok' }); return; }
    const { data: factors } = await supabase.auth.mfa.listFactors();
    const totp = factors?.totp?.find((f) => f.status === 'verified');
    if (totp) setState({ kind: 'verify', factorId: totp.id });
    else setState(REQUIRED ? { kind: 'enroll' } : { kind: 'ok' });
  }, []);
  useEffect(() => { check(); }, [check]);

  const verify = async (e: FormEvent) => {
    e.preventDefault();
    if (state.kind !== 'verify') return;
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.auth.mfa.challengeAndVerify({ factorId: state.factorId, code: code.trim() });
    setBusy(false);
    if (err) { setError('That code is not right. Try the newest code in your authenticator app.'); setCode(''); return; }
    setState({ kind: 'ok' });
  };

  if (state.kind === 'ok') return <>{children}</>;

  return (
    <div className="admin-shell flex min-h-screen w-full items-center justify-center p-6">
      <div className="admin-card w-full max-w-md space-y-5 p-8">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-[var(--admin-accent-soft)] text-[var(--brand-blue)]"><ShieldCheck className="h-7 w-7" /></span>
        {state.kind === 'loading' && <p className="admin-muted flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Checking your sign-in…</p>}
        {state.kind === 'verify' && (
          <form onSubmit={verify} className="space-y-4">
            <h1 className="admin-title">Two-step <em>sign-in</em></h1>
            <label htmlFor="mfa-code" className="admin-label">Enter the 6-digit code from your authenticator app</label>
            <input id="mfa-code" autoFocus inputMode="numeric" autoComplete="one-time-code" maxLength={6} className="admin-field text-center text-2xl tracking-[0.4em]"
              value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} />
            {error && <p role="alert" className="text-sm text-[var(--admin-bad)]">{error}</p>}
            <ActionButton type="submit" variant="primary" loading={busy} disabled={code.length !== 6} className="w-full justify-center">Continue</ActionButton>
            <button type="button" className="admin-muted w-full text-sm underline" onClick={() => supabase.auth.signOut().then(() => { window.location.href = '/auth'; })}>Sign out</button>
          </form>
        )}
        {state.kind === 'enroll' && (
          <>
            <h1 className="admin-title">Set up two-step <em>sign-in</em></h1>
            <p className="admin-muted">Admin accounts must use a one-time code from an authenticator app.</p>
            <MfaEnroll onDone={check} />
          </>
        )}
      </div>
    </div>
  );
};

export default MfaGate;

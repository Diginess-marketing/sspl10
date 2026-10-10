import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ShieldCheck, ShieldOff, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader, ActionButton, ConfirmDialog, StatusBadge } from '@/components/admin/ui';
import { MfaEnroll } from '@/components/admin/MfaGate';

// The signed-in admin's own two-step sign-in (PRD section 10).

interface Factor { id: string; friendly_name?: string; status: string; created_at: string }

const Security = () => {
  const [factors, setFactors] = useState<Factor[] | null>(null);
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<Factor | null>(null);

  const load = useCallback(async () => {
    const { data } = await supabase.auth.mfa.listFactors();
    setFactors((data?.totp || []).filter((f) => f.status === 'verified') as Factor[]);
  }, []);
  useEffect(() => { load(); }, [load]);

  const remove = async () => {
    if (!removing) return;
    const { error } = await supabase.auth.mfa.unenroll({ factorId: removing.id });
    if (error) toast.error('Could not turn it off', { description: error.message });
    else toast.success('Two-step sign-in turned off for this device');
    setRemoving(null);
    load();
  };

  const on = (factors?.length || 0) > 0;
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Your account" title={<>Sign-in <em>security</em></>} description="Two-step sign-in asks for a one-time code from your phone each time you sign in to the admin panel." />
      <section className="admin-card max-w-xl space-y-4 p-6">
        <div className="flex items-center gap-3">
          {on ? <ShieldCheck className="h-6 w-6 text-[var(--admin-ok)]" /> : <ShieldOff className="h-6 w-6 text-[var(--admin-bad)]" />}
          <h2 className="admin-h3">Two-step sign-in</h2>
          <StatusBadge status={on ? 'active' : 'pending'} label={on ? 'On' : 'Off'} />
        </div>
        {factors?.map((f) => (
          <div key={f.id} className="flex items-center justify-between rounded-xl bg-[var(--admin-bg)] px-4 py-3">
            <span>
              <span className="block font-semibold">{f.friendly_name || 'Authenticator app'}</span>
              <span className="admin-muted text-sm">Added {new Date(f.created_at).toLocaleDateString('en-IN')}</span>
            </span>
            <ActionButton size="sm" variant="ghost" icon={Trash2} onClick={() => setRemoving(f)} className="!text-[var(--admin-bad)]">Remove</ActionButton>
          </div>
        ))}
        {adding
          ? <MfaEnroll onDone={() => { setAdding(false); toast.success('Two-step sign-in is on'); load(); }} />
          : !on && <ActionButton variant="primary" icon={ShieldCheck} onClick={() => setAdding(true)}>Turn on</ActionButton>}
      </section>
      <ConfirmDialog
        open={removing !== null}
        onOpenChange={(o) => { if (!o) setRemoving(null); }}
        tone="danger"
        title="Turn off two-step sign-in?"
        description="Anyone with your password could then sign in to the admin panel."
        confirmLabel="Turn off"
        onConfirm={remove}
      />
    </div>
  );
};

export default Security;

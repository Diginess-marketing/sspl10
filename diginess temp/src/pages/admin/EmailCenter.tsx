import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Eye, Save, Send, Mail, Paperclip, Power, Users } from 'lucide-react';
import { PageHeader, ActionButton, ConfirmDialog, StatusBadge } from '@/components/admin/ui';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EmailEditor } from '@/components/admin/email/EmailEditor';
import { adminApi } from '@/lib/adminApi';

interface EmailTemplate {
  key: string;
  name: string;
  subject: string;
  body_html: string;
  enabled: boolean;
  attach_certificate: boolean;
  updated_at?: string;
}

type Draft = Pick<EmailTemplate, 'subject' | 'body_html' | 'enabled' | 'attach_certificate'>;

const LEVELS = [1, 2, 3, 4, 5];
const OUTCOMES = [
  { value: 'selected', label: 'Selected', status: 'selected' },
  { value: 'not_selected', label: 'Not selected', status: 'not_selected' },
  { value: 'absent', label: 'Absent', status: 'absent' },
] as const;

const AUDIENCES = [
  { value: 'paid_users', label: 'Paid players' },
  { value: 'all_registrations', label: 'All registrations' },
  { value: 'failed_payments', label: 'Failed payments' },
];

const templateKey = (level: number, outcome: string) => `trial_l${level}_${outcome}`;
const CONFIRMATION_KEY = 'registration_confirmation';
const toDraft = (t: EmailTemplate): Draft => ({
  subject: t.subject, body_html: t.body_html, enabled: t.enabled, attach_certificate: t.attach_certificate,
});
const sameDraft = (a: Draft, b: Draft) =>
  a.subject === b.subject && a.body_html === b.body_html && a.enabled === b.enabled && a.attach_certificate === b.attach_certificate;

/** Rendered email preview in an isolated frame (same layout the player receives). */
const PreviewDialog = ({ open, onOpenChange, preview }: {
  open: boolean; onOpenChange: (open: boolean) => void; preview: { subject: string; html: string } | null;
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="admin-scope bg-white p-6 sm:max-w-3xl">
      <DialogHeader>
        <DialogTitle className="admin-h3 text-lg">Preview</DialogTitle>
      </DialogHeader>
      {preview && (
        <div className="space-y-3">
          <p className="text-sm"><span className="admin-muted">Subject:</span> <strong>{preview.subject}</strong></p>
          <p className="admin-muted text-xs">Shown with sample player details.</p>
          <iframe title="Email preview" className="email-preview" sandbox="" srcDoc={preview.html} />
        </div>
      )}
    </DialogContent>
  </Dialog>
);

// ---------------------------------------------------------------------------
// Level emails: the templates sent automatically when a trial result is marked
// ---------------------------------------------------------------------------
const LevelEmails = ({ placeholders, templates, onSaved, loadError }: {
  placeholders: Record<string, string>;
  templates: EmailTemplate[];
  onSaved: (t: EmailTemplate) => void;
  loadError: string | null;
}) => {
  const [selectedKey, setSelectedKey] = useState(templateKey(1, 'selected'));
  const selected = templates.find((t) => t.key === selectedKey) ?? null;
  // Unsaved edits per template; a template without an entry shows its saved version
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [busy, setBusy] = useState<'save' | 'preview' | 'test' | null>(null);
  const [preview, setPreview] = useState<{ subject: string; html: string } | null>(null);

  const draft: Draft | null = selected ? drafts[selected.key] ?? toDraft(selected) : null;
  const setDraft = (next: Draft | ((d: Draft) => Draft)) => {
    if (!selected) return;
    setDrafts((all) => {
      const current = all[selected.key] ?? toDraft(selected);
      return { ...all, [selected.key]: typeof next === 'function' ? next(current) : next };
    });
  };

  const dirty = Boolean(selected && draft && !sameDraft(toDraft(selected), draft));
  const isAbsent = selectedKey.endsWith('_absent');
  const isConfirmation = selectedKey === CONFIRMATION_KEY;

  const choose = (key: string) => {
    if (key === selectedKey) return;
    if (dirty && selected) {
      if (!window.confirm('Discard unsaved changes to this email?')) return;
      setDrafts(({ [selected.key]: _discarded, ...rest }) => rest);
    }
    setSelectedKey(key);
  };

  const save = async () => {
    if (!selected || !draft) return;
    setBusy('save');
    try {
      const saved = await adminApi.put<EmailTemplate>(`/admin/email/templates/${selected.key}`, { name: selected.name, ...draft });
      onSaved(saved);
      setDrafts(({ [saved.key]: _saved, ...rest }) => rest);
      toast.success(`${selected.name} saved`);
    } catch (err: any) {
      toast.error('Could not save', { description: err.message });
    } finally {
      setBusy(null);
    }
  };

  const showPreview = async () => {
    if (!draft) return;
    setBusy('preview');
    try {
      setPreview(await adminApi.post('/admin/email/preview', { ...draft, key: selectedKey }));
    } catch (err: any) {
      toast.error('Preview failed', { description: err.message });
    } finally {
      setBusy(null);
    }
  };

  const sendTest = async () => {
    if (!draft) return;
    setBusy('test');
    try {
      const r = await adminApi.post<{ to: string }>('/admin/email/test', { ...draft, key: selectedKey });
      toast.success(`Test email sent to ${r.to}`);
    } catch (err: any) {
      toast.error('Test email failed', { description: err.message });
    } finally {
      setBusy(null);
    }
  };

  if (loadError) {
    return (
      <div className="admin-card p-6">
        <p className="font-semibold text-[var(--admin-ink)]">Email templates could not be loaded.</p>
        <p className="admin-muted mt-1">{loadError}</p>
        <p className="admin-muted mt-1">If this is a new setup, run the database migration <code>20261005000000_trial_levels_certificates_email.sql</code> first.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
      <nav className="admin-card p-3 space-y-3 self-start" aria-label="Level email templates">
        <div>
          <p className="admin-eyebrow px-2 pb-1">Registration</p>
          <button
            type="button"
            onClick={() => choose(CONFIRMATION_KEY)}
            aria-current={selectedKey === CONFIRMATION_KEY ? 'true' : undefined}
            className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-sm transition-colors ${
              selectedKey === CONFIRMATION_KEY ? 'bg-[var(--brand-navy)] text-white' : 'hover:bg-[var(--brand-sky-2)]'
            }`}
          >
            <span style={selectedKey === CONFIRMATION_KEY ? { color: '#fff' } : undefined}>Payment confirmation</span>
          </button>
        </div>
        {LEVELS.map((level) => (
          <div key={level}>
            <p className="admin-eyebrow px-2 pb-1">Level {level}</p>
            <ul className="space-y-1">
              {OUTCOMES.map((o) => {
                const key = templateKey(level, o.value);
                const t = templates.find((x) => x.key === key);
                return (
                  <li key={key}>
                    <button
                      type="button"
                      onClick={() => choose(key)}
                      aria-current={key === selectedKey ? 'true' : undefined}
                      className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                        key === selectedKey ? 'bg-[var(--brand-navy)] text-white' : 'hover:bg-[var(--brand-sky-2)]'
                      }`}
                    >
                      <span style={key === selectedKey ? { color: '#fff' } : undefined}>{o.label}</span>
                      {t && !t.enabled ? <StatusBadge status="skipped" label="Off" /> : t?.attach_certificate ? <Paperclip className="h-3.5 w-3.5 opacity-70" aria-label="Certificate attached" /> : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {selected && draft ? (
        <section className="admin-card p-5 space-y-4" aria-label={`Edit ${selected.name}`}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="admin-h text-lg">{selected.name}</h2>
              <p className="admin-muted text-sm">
                {isConfirmation
                  ? 'Sent automatically when a player\'s registration payment succeeds, and by "Send email" in Trials → Registrations.'
                  : `Sent automatically when a player is marked ${selected.key.replace(/^trial_l\d_/, '').replace('_', ' ')} at this level.`}
                {dirty && <strong className="ml-2 text-[var(--admin-ink)]">Unsaved changes</strong>}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <ActionButton variant="ghost" size="sm" icon={Eye} loading={busy === 'preview'} onClick={showPreview}>Preview</ActionButton>
              <ActionButton variant="soft" size="sm" icon={Send} loading={busy === 'test'} onClick={sendTest}>Send test to me</ActionButton>
              <ActionButton variant="primary" size="sm" icon={Save} loading={busy === 'save'} disabled={!dirty} onClick={save}>Save</ActionButton>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="h-4 w-4 accent-[var(--brand-blue)]" checked={draft.enabled} onChange={(e) => setDraft({ ...draft, enabled: e.target.checked })} />
              <Power className="h-4 w-4" aria-hidden="true" /> Send automatically
            </label>
            {!isAbsent && !isConfirmation && (
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="h-4 w-4 accent-[var(--brand-blue)]" checked={draft.attach_certificate} onChange={(e) => setDraft({ ...draft, attach_certificate: e.target.checked })} />
                <Paperclip className="h-4 w-4" aria-hidden="true" /> Attach {selectedKey.includes('not_selected') ? 'participation' : 'achievement'} certificate (PDF)
              </label>
            )}
          </div>

          <div>
            <label className="admin-label" htmlFor="tpl-subject">Subject</label>
            <input id="tpl-subject" className="admin-field" value={draft.subject} onChange={(e) => setDraft({ ...draft, subject: e.target.value })} />
          </div>

          <div>
            <span className="admin-label">Message</span>
            <EmailEditor
              value={draft.body_html}
              onChange={(html) => setDraft((d) => ({ ...d, body_html: html }))}
              placeholders={placeholders}
            />
            <p className="admin-muted mt-2 text-xs">
              Fields like <code>{'{{name}}'}</code> are filled in for each player. The SSPL header and footer are added automatically.
            </p>
          </div>
        </section>
      ) : (
        <div className="admin-card p-6 admin-muted">This template does not exist yet. Run the database migration to create the defaults.</div>
      )}

      <PreviewDialog open={preview !== null} onOpenChange={(o) => !o && setPreview(null)} preview={preview} />
    </div>
  );
};

// ---------------------------------------------------------------------------
// Compose: a one-off email to an audience
// ---------------------------------------------------------------------------
const Compose = () => {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState('paid_users');
  const [busy, setBusy] = useState<'preview' | 'test' | 'send' | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [preview, setPreview] = useState<{ subject: string; html: string } | null>(null);

  const ready = subject.trim() && body.trim();
  const audienceLabel = AUDIENCES.find((a) => a.value === audience)?.label ?? audience;

  const showPreview = async () => {
    setBusy('preview');
    try {
      setPreview(await adminApi.post('/admin/email/preview', { subject, body_html: body }));
    } catch (err: any) {
      toast.error('Preview failed', { description: err.message });
    } finally {
      setBusy(null);
    }
  };

  const sendTest = async () => {
    setBusy('test');
    try {
      const r = await adminApi.post<{ to: string }>('/admin/email/test', { subject, body_html: body });
      toast.success(`Test email sent to ${r.to}`);
    } catch (err: any) {
      toast.error('Test email failed', { description: err.message });
    } finally {
      setBusy(null);
    }
  };

  const send = async () => {
    setBusy('send');
    try {
      const r = await adminApi.post<{ queued?: number; success?: number; failed?: number; message?: string }>(
        '/admin/email/bulk',
        { subject, body, filter: audience, useLayout: true },
      );
      if (r.queued) toast.success(`Sending to ${r.queued} recipients`, { description: 'This continues in the background; results appear in the email logs.' });
      else toast.success(r.message || `${r.success ?? 0} sent, ${r.failed ?? 0} failed`);
      setConfirmOpen(false);
    } catch (err: any) {
      toast.error('Send failed', { description: err.message });
    } finally {
      setBusy(null);
    }
  };

  return (
    <section className="admin-card p-5 space-y-4" aria-label="Compose email">
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_240px]">
        <div>
          <label className="admin-label" htmlFor="compose-subject">Subject</label>
          <input id="compose-subject" className="admin-field" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. SSPL Level 3 trial schedule" />
        </div>
        <div>
          <label className="admin-label" htmlFor="compose-audience"><Users className="h-4 w-4" /> Send to</label>
          <select id="compose-audience" className="admin-field" value={audience} onChange={(e) => setAudience(e.target.value)}>
            {AUDIENCES.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
          </select>
        </div>
      </div>

      <div>
        <span className="admin-label">Message</span>
        <EmailEditor value={body} onChange={setBody} />
        <p className="admin-muted mt-2 text-xs">Everyone gets the same message (no per-player fields). The SSPL header and footer are added automatically.</p>
      </div>

      <div className="flex flex-wrap justify-end gap-2">
        <ActionButton variant="ghost" size="sm" icon={Eye} disabled={!ready} loading={busy === 'preview'} onClick={showPreview}>Preview</ActionButton>
        <ActionButton variant="soft" size="sm" icon={Send} disabled={!ready} loading={busy === 'test'} onClick={sendTest}>Send test to me</ActionButton>
        <ActionButton variant="primary" size="sm" icon={Mail} disabled={!ready} onClick={() => setConfirmOpen(true)}>Send to {audienceLabel.toLowerCase()}</ActionButton>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        tone="danger"
        title={`Email all ${audienceLabel.toLowerCase()}?`}
        description={`"${subject}" goes to every address in "${audienceLabel}". This cannot be undone. Send yourself a test first.`}
        confirmLabel="Send now"
        loading={busy === 'send'}
        onConfirm={send}
      />
      <PreviewDialog open={preview !== null} onOpenChange={(o) => !o && setPreview(null)} preview={preview} />
    </section>
  );
};

// ---------------------------------------------------------------------------

const EmailCenter = () => {
  const [tab, setTab] = useState<'levels' | 'compose'>('levels');
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [placeholders, setPlaceholders] = useState<Record<string, string>>({});
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    adminApi
      .get<{ templates: EmailTemplate[]; placeholders: Record<string, string> }>('/admin/email/templates')
      .then((r) => {
        if (!active) return;
        setTemplates(r.templates);
        setPlaceholders(r.placeholders);
        setLoadError(null);
      })
      .catch((err) => active && setLoadError(err.message));
    return () => {
      active = false;
    };
  }, []);

  const enabledCount = useMemo(() => templates.filter((t) => t.key.startsWith('trial_') && t.enabled).length, [templates]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Communication"
        title={<>Email <em>center</em></>}
        description={`Design the emails players get at each trial level (${enabledCount} of 15 switched on), or write a one-off email.`}
      />

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Email sections">
        <button type="button" role="tab" className="admin-chip" aria-selected={tab === 'levels'} data-active={tab === 'levels'} onClick={() => setTab('levels')}>Level emails</button>
        <button type="button" role="tab" className="admin-chip" aria-selected={tab === 'compose'} data-active={tab === 'compose'} onClick={() => setTab('compose')}>Compose</button>
      </div>

      {tab === 'levels' ? (
        <LevelEmails
          placeholders={placeholders}
          templates={templates}
          loadError={loadError}
          onSaved={(saved) => setTemplates((list) => list.map((t) => (t.key === saved.key ? saved : t)))}
        />
      ) : (
        <Compose />
      )}
    </div>
  );
};

export default EmailCenter;

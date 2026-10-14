type Tone = 'ok' | 'warn' | 'bad' | 'info' | 'neutral';

// One place that decides the colour of every status used across the admin.
const MAP: Record<string, { tone: Tone; label?: string }> = {
  captured: { tone: 'ok', label: 'Paid' }, paid: { tone: 'ok', label: 'Paid' }, success: { tone: 'ok', label: 'Paid' },
  completed: { tone: 'ok' }, selected: { tone: 'ok' }, approved: { tone: 'ok' }, attended: { tone: 'ok' }, present: { tone: 'ok' },
  active: { tone: 'ok' }, confirmed: { tone: 'ok' }, sent: { tone: 'ok', label: 'Emailed' },
  skipped: { tone: 'neutral', label: 'Not emailed' }, not_emailed: { tone: 'neutral', label: 'Not emailed' },
  pending: { tone: 'warn' }, waitlisted: { tone: 'warn' }, refunded: { tone: 'warn', label: 'Refunded' }, registration: { tone: 'warn', label: 'Registered' },
  failed: { tone: 'bad' }, rejected: { tone: 'bad' }, not_selected: { tone: 'bad', label: 'Not selected' }, absent: { tone: 'bad' },
  trials_section: { tone: 'info', label: 'Trials section' }, trials_allocated: { tone: 'info', label: 'Allocated' },
};

export const StatusBadge = ({ status, label }: { status: string | null | undefined; label?: string }) => {
  const key = (status || '').toLowerCase();
  const entry = MAP[key];
  const tone = entry?.tone ?? 'neutral';
  const text = label ?? entry?.label ?? (key ? key.replace(/_/g, ' ') : 'Unknown');
  return <span className={`admin-badge admin-badge--${tone}`}>{text}</span>;
};

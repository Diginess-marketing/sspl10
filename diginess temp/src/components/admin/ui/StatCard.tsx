import type { ComponentType, ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: string;
  icon: ComponentType<{ className?: string }>;
  to?: string;                 // makes the card a link
  loading?: boolean;
  tone?: 'blue' | 'lime' | 'green' | 'amber';
}

const TONES = {
  blue: 'bg-[var(--brand-sky-2)] text-[var(--brand-blue)]',
  lime: 'bg-[var(--brand-lime)] text-[var(--brand-navy)]',
  green: 'bg-[var(--admin-ok-bg)] text-[var(--admin-ok)]',
  amber: 'bg-[var(--admin-warn-bg)] text-[var(--admin-warn)]',
};

export const StatCard = ({ label, value, hint, icon: Icon, to, loading, tone = 'blue' }: StatCardProps) => {
  const body = (
    <div className="admin-card admin-card--lift flex h-full items-start justify-between gap-4 p-5">
      <div className="min-w-0">
        <p className="admin-eyebrow !mb-3 !text-[var(--admin-ink-soft)]">{label}</p>
        {loading ? <div className="h-7 w-16 animate-pulse rounded-md bg-[var(--brand-sky-2)]" /> : <p className="admin-num">{value}</p>}
        {hint && <p className="admin-muted mt-2">{hint}</p>}
      </div>
      <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-full ${TONES[tone]}`}>
        <Icon className="h-5 w-5" />
      </span>
    </div>
  );
  return to ? <Link to={to} className="block h-full focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--brand-blue)]/30 rounded-[18px]">{body}</Link> : body;
};

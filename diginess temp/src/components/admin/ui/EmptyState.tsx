import type { ComponentType, ReactNode } from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: ReactNode;
}

export const EmptyState = ({ icon: Icon = Inbox, title, description, action }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
    <span className="grid h-16 w-16 place-items-center rounded-full bg-[var(--brand-sky-2)] text-[var(--brand-blue)]">
      <Icon className="h-7 w-7" />
    </span>
    <h3 className="admin-h3">{title}</h3>
    {description && <p className="admin-muted max-w-[46ch]">{description}</p>}
    {action}
  </div>
);

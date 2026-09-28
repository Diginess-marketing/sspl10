import type { ReactNode } from 'react';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import {
  AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ActionButton } from './ActionButton';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  tone?: 'default' | 'danger';
  loading?: boolean;
  children?: ReactNode;          // extra content, e.g. a summary of what will change
  onConfirm: () => void | Promise<void>;
}

// Used for every action that moves data (stage changes, deletes) so nothing happens on a single click.
export const ConfirmDialog = ({
  open, onOpenChange, title, description, confirmLabel = 'Confirm', tone = 'default', loading, children, onConfirm,
}: ConfirmDialogProps) => (
  <AlertDialog open={open} onOpenChange={onOpenChange}>
    <AlertDialogContent className="admin-shell max-w-md rounded-[18px] border-[var(--admin-line)] bg-white p-0 overflow-hidden">
      <div className="flex items-start gap-4 p-6">
        <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-full ${tone === 'danger' ? 'bg-[var(--admin-bad-bg)] text-[var(--admin-bad)]' : 'bg-[var(--brand-sky-2)] text-[var(--brand-blue)]'}`}>
          {tone === 'danger' ? <AlertTriangle className="h-5 w-5" /> : <ArrowRight className="h-5 w-5" />}
        </span>
        <AlertDialogHeader className="space-y-2 text-left">
          <AlertDialogTitle className="admin-h3">{title}</AlertDialogTitle>
          {description && <AlertDialogDescription className="admin-muted">{description}</AlertDialogDescription>}
          {children}
        </AlertDialogHeader>
      </div>
      <AlertDialogFooter className="flex-row justify-end gap-2 border-t border-[var(--admin-line)] bg-[var(--admin-bg)] px-6 py-4">
        <ActionButton variant="ghost" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</ActionButton>
        <ActionButton
          variant={tone === 'danger' ? 'danger' : 'primary'}
          loading={loading}
          onClick={async () => { await onConfirm(); }}
        >
          {confirmLabel}
        </ActionButton>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

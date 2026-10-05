import type { ReactNode } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';

interface DetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eyebrow?: string;
  title: string;
  description?: string;
  footer?: ReactNode;
  children: ReactNode;
}

// Slide-over panel for a row's details or a guided form (allocate, enter results).
export const DetailDrawer = ({ open, onOpenChange, eyebrow, title, description, footer, children }: DetailDrawerProps) => (
  <Sheet open={open} onOpenChange={onOpenChange}>
    <SheetContent side="right" className="admin-shell flex w-full flex-col gap-0 border-l border-[var(--admin-line)] bg-white p-0 sm:max-w-lg">
      <SheetHeader className="space-y-1 border-b border-[var(--admin-line)] bg-[var(--brand-sky)] px-6 py-5 text-left">
        {eyebrow && <p className="admin-eyebrow !mb-0">{eyebrow}</p>}
        <SheetTitle className="admin-h3">{title}</SheetTitle>
        {description && <SheetDescription className="admin-muted">{description}</SheetDescription>}
      </SheetHeader>
      <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      {footer && <div className="flex justify-end gap-2 border-t border-[var(--admin-line)] bg-[var(--admin-bg)] px-6 py-4">{footer}</div>}
    </SheetContent>
  </Sheet>
);

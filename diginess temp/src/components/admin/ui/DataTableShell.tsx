import type { ReactNode } from 'react';
import { Search, X } from 'lucide-react';
import { ActionButton } from './ActionButton';
import { EmptyState } from './EmptyState';

export interface FilterChip { value: string; label: string; count?: number }

interface DataTableShellProps {
  title?: string;
  description?: string;
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: FilterChip[];
  activeFilter?: string;
  onFilterChange?: (value: string) => void;
  actions?: ReactNode;               // right side of the toolbar (export, refresh...)
  selectedCount?: number;
  bulkActions?: ReactNode;           // shown in a bar when rows are selected
  onClearSelection?: () => void;
  loading?: boolean;
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  children: ReactNode;               // a <table className="admin-table"> ... </table>
}

// Card wrapper every admin list uses: toolbar (search, filter chips, actions), bulk-action bar,
// loading skeleton, empty state, and a sticky-header table area.
export const DataTableShell = ({
  title, description, search, onSearchChange, searchPlaceholder = 'Search…', filters, activeFilter, onFilterChange,
  actions, selectedCount = 0, bulkActions, onClearSelection, loading, isEmpty, emptyTitle = 'Nothing here yet', emptyDescription, children,
}: DataTableShellProps) => (
  <section className="admin-card overflow-hidden">
    {(title || onSearchChange || actions || filters) && (
      <header className="space-y-4 border-b border-[var(--admin-line)] p-5">
        {(title || actions) && (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              {title && <h2 className="admin-h3">{title}</h2>}
              {description && <p className="admin-muted mt-1">{description}</p>}
            </div>
            {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-3">
          {onSearchChange && (
            <div className="relative w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-ink-soft)]" />
              <input
                className="admin-input"
                value={search ?? ''}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
              />
            </div>
          )}
          {filters && (
            <div className="flex flex-wrap gap-2" role="tablist">
              {filters.map((f) => (
                <button key={f.value} type="button" role="tab" className="admin-chip" data-active={activeFilter === f.value} onClick={() => onFilterChange?.(f.value)}>
                  {f.label}{typeof f.count === 'number' && <span className="opacity-70">{f.count}</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>
    )}

    {selectedCount > 0 && (
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--admin-line)] bg-[var(--brand-navy)] px-5 py-3 animate-in slide-in-from-top-2">
        <p className="admin-muted !text-white">{selectedCount} selected</p>
        <div className="flex flex-wrap items-center gap-2">
          {bulkActions}
          {onClearSelection && <ActionButton variant="ghost" size="sm" icon={X} onClick={onClearSelection} className="!text-white hover:!bg-white/10">Clear</ActionButton>}
        </div>
      </div>
    )}

    {loading ? (
      <div className="space-y-3 p-5">{[...Array(5)].map((_, i) => <div key={i} className="h-12 animate-pulse rounded-xl bg-[var(--brand-sky)]" />)}</div>
    ) : isEmpty ? (
      <EmptyState title={emptyTitle} description={emptyDescription} />
    ) : (
      <div className="admin-table-wrap">{children}</div>
    )}
  </section>
);

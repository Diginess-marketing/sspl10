import React from 'react';
import { ChevronRight, Home, MoreHorizontal } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  current?: boolean;
}

interface EnhancedBreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  maxItems?: number;
  className?: string;
  onItemClick?: (item: BreadcrumbItem, index: number) => void;
}

const EnhancedBreadcrumb: React.FC<EnhancedBreadcrumbProps> = ({
  items,
  separator = <ChevronRight className="w-4 h-4" />,
  maxItems = 5,
  className = '',
  onItemClick,
}) => {
  const handleItemClick = (item: BreadcrumbItem, index: number) => {
    if (item.href) {
      window.location.href = item.href;
    }
    onItemClick?.(item, index);
  };

  // Handle overflow for long breadcrumb lists
  const shouldCollapse = items.length > maxItems;
  const visibleItems: BreadcrumbItem[] = shouldCollapse
    ? [
        items[0], // Always show first item
        { label: '...', icon: <MoreHorizontal className="w-4 h-4" />, current: false, href: undefined },
        ...items.slice(-2), // Show last 2 items
      ]
    : items;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center space-x-1 text-sm', className)}
    >
      <ol className="flex items-center space-x-1">
        {visibleItems.map((item, index) => {
          const isLast = index === visibleItems.length - 1;
          const isFirst = index === 0;
          const actualIndex = shouldCollapse && index === 1 ? items.length - 2 : index;

          return (
            <li key={index} className="flex items-center">
              {/* Separator (except for first item) */}
              {!isFirst && (
                <span className="mx-2 text-gray-400" aria-hidden="true">
                  {separator}
                </span>
              )}

              {/* Breadcrumb Item */}
              {item.label === '...' ? (
                <span className="flex items-center px-2 py-1 text-gray-500">
                  {item.icon}
                </span>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleItemClick(item, actualIndex)}
                  disabled={item.current || !item.href}
                  className={cn(
                    'px-2 py-1 h-auto font-medium transition-all duration-200',
                    item.current
                      ? 'text-cricket-blue bg-cricket-blue/10 cursor-default'
                      : item.href
                        ? 'text-gray-600 hover:text-cricket-blue hover:bg-cricket-light-blue/20'
                        : 'text-gray-400 cursor-default',
                    'flex items-center gap-1.5',
                  )}
                >
                  {/* Icon */}
                  {item.icon && (
                    <span className="shrink-0">
                      {item.icon}
                    </span>
                  )}

                  {/* Label */}
                  <span className={cn(
                    'truncate max-w-32',
                    item.current && 'font-semibold',
                  )}>
                    {item.label}
                  </span>

                  {/* Current page indicator */}
                  {item.current && (
                    <span className="sr-only">(current)</span>
                  )}
                </Button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

// Pre-configured breadcrumb components for common use cases
export const PageBreadcrumb: React.FC<{
  pageTitle: string;
  parentPages?: Array<{ label: string; href?: string }>;
  className?: string;
}> = ({ pageTitle, parentPages = [], className }) => {
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Home', href: '/', icon: <Home className="w-4 h-4" /> },
    ...parentPages.map(page => ({ ...page, icon: undefined })),
    { label: pageTitle, current: true },
  ];

  return (
    <EnhancedBreadcrumb
      items={breadcrumbItems}
      className={cn('mb-6', className)}
    />
  );
};

export const TeamBreadcrumb: React.FC<{
  teamName: string;
  teamId?: string;
  section?: string;
  className?: string;
}> = ({ teamName, teamId, section, className }) => {
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Home', href: '/', icon: <Home className="w-4 h-4" /> },
    { label: 'Teams', href: '/teams' },
    { label: teamName, href: teamId ? `/teams/${teamId}` : undefined, current: !section },
  ];

  if (section) {
    breadcrumbItems.push({ label: section, current: true });
  }

  return (
    <EnhancedBreadcrumb
      items={breadcrumbItems}
      className={cn('mb-6', className)}
    />
  );
};

export const PlayerBreadcrumb: React.FC<{
  playerName: string;
  playerId?: string;
  teamName?: string;
  teamId?: string;
  section?: string;
  className?: string;
}> = ({ playerName, playerId, teamName, teamId, section, className }) => {
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Home', href: '/', icon: <Home className="w-4 h-4" /> },
  ];

  if (teamName) {
    breadcrumbItems.push(
      { label: 'Teams', href: '/teams' },
      { label: teamName, href: teamId ? `/teams/${teamId}` : undefined },
    );
  }

  breadcrumbItems.push(
    { label: playerName, href: playerId ? `/players/${playerId}` : undefined, current: !section },
  );

  if (section) {
    breadcrumbItems.push({ label: section, current: true });
  }

  return (
    <EnhancedBreadcrumb
      items={breadcrumbItems}
      className={cn('mb-6', className)}
    />
  );
};

export const MatchBreadcrumb: React.FC<{
  matchTitle: string;
  matchId?: string;
  tournamentName?: string;
  section?: string;
  className?: string;
}> = ({ matchTitle, matchId, tournamentName, section, className }) => {
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Home', href: '/', icon: <Home className="w-4 h-4" /> },
    { label: 'Matches', href: '/matches' },
  ];

  if (tournamentName) {
    breadcrumbItems.push({ label: tournamentName, href: '/tournament' });
  }

  breadcrumbItems.push(
    { label: matchTitle, href: matchId ? `/matches/${matchId}` : undefined, current: !section },
  );

  if (section) {
    breadcrumbItems.push({ label: section, current: true });
  }

  return (
    <EnhancedBreadcrumb
      items={breadcrumbItems}
      className={cn('mb-6', className)}
    />
  );
};

export default EnhancedBreadcrumb;
import * as React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Team {
  name: string
  logo?: string
  abbreviation: string
  players?: number
  captain?: string
  coach?: string
  founded?: string
  achievements?: string[]
  stats?: {
    matches: number
    wins: number
    losses: number
    winRate: number
  }
}

interface FixtureCardProps {
  homeTeam: Team
  awayTeam: Team
  date: string
  time: string
  venue: string
  status: 'upcoming' | 'live' | 'completed' | 'cancelled'
  score?: {
    home: number
    away: number
  }
  isLoading?: boolean
  onClick?: () => void
  className?: string
}

const FixtureCard = React.forwardRef<
  HTMLDivElement,
  FixtureCardProps
>(({
  homeTeam,
  awayTeam,
  date,
  time,
  venue,
  status,
  score,
  isLoading = false,
  onClick,
  className,
  ...props
}, ref) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'destructive';
      case 'completed': return 'secondary';
      case 'cancelled': return 'outline';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'live': return 'LIVE';
      case 'completed': return 'FT';
      case 'cancelled': return 'CANCELLED';
      default: return 'UPCOMING';
    }
  };

  return (
    <Card
      ref={ref}
      variant="fixture"
      isLoading={isLoading}
      clickable={Boolean(onClick)}
      onClick={onClick}
      className={cn('h-full', className)}
      ariaLabel={`Match between ${homeTeam.name} and ${awayTeam.name} on ${formatDate(date)} at ${venue}`}
      {...props}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Badge variant={getStatusColor(status)} className="text-xs font-medium">
            {getStatusText(status)}
          </Badge>
          <span className="text-xs text-muted-foreground font-medium">
            {formatDate(date)}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Teams */}
        <div className="flex items-center justify-between">
          {/* Home Team */}
          <div className="flex items-center space-x-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-linear-to-br from-primary/20 to-secondary/20 flex items-center justify-center overflow-hidden">
              {homeTeam.logo ? (
                <img
                  src={homeTeam.logo}
                  alt={`${homeTeam.name} logo`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <span className="text-xs font-bold text-primary">
                  {homeTeam.abbreviation}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate">{homeTeam.name}</h3>
              {score && status === 'completed' && (
                <span className="text-lg font-bold text-primary">{score.home}</span>
              )}
            </div>
          </div>

          {/* VS */}
          <div className="px-4 text-center">
            {status === 'live' && (
              <div className="text-xs text-destructive font-medium animate-pulse">VS</div>
            )}
            {status === 'completed' && (
              <div className="text-xs text-muted-foreground">VS</div>
            )}
            {status === 'upcoming' && (
              <div className="text-xs text-muted-foreground">VS</div>
            )}
          </div>

          {/* Away Team */}
          <div className="flex items-center space-x-3 flex-1 justify-end">
            <div className="flex-1 min-w-0 text-right">
              <h3 className="font-semibold text-sm truncate">{awayTeam.name}</h3>
              {score && status === 'completed' && (
                <span className="text-lg font-bold text-primary">{score.away}</span>
              )}
            </div>
            <div className="w-10 h-10 rounded-full bg-linear-to-br from-secondary/20 to-accent/20 flex items-center justify-center overflow-hidden">
              {awayTeam.logo ? (
                <img
                  src={awayTeam.logo}
                  alt={`${awayTeam.name} logo`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <span className="text-xs font-bold text-secondary">
                  {awayTeam.abbreviation}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Match Details */}
        <div className="space-y-2 pt-2 border-t border-border/50">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center space-x-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{time}</span>
            </span>
            <span className="flex items-center space-x-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="truncate max-w-24">{venue}</span>
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

FixtureCard.displayName = 'FixtureCard';

export { FixtureCard, type FixtureCardProps, type Team };
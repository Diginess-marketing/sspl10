import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TeamCardProps {
  name: string
  logo?: string
  bannerImage?: string
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
  isLoading?: boolean
  onClick?: () => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const TeamCard = React.forwardRef<
  HTMLDivElement,
  TeamCardProps
>(({
  name,
  logo,
  bannerImage,
  players = 0,
  captain,
  coach,
  founded,
  achievements = [],
  stats,
  isLoading = false,
  onClick,
  className,
  size = 'md',
  ...props
}, ref) => {
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);

  const sizeClasses = {
    sm: 'w-full max-w-[200px] sm:w-48',
    md: 'w-full max-w-[240px] sm:w-56',
    lg: 'w-full max-w-[280px] sm:w-64',
  };

  const imageSizeClasses = {
    sm: 'h-32 sm:h-32',
    md: 'h-40 sm:h-40',
    lg: 'h-48 sm:h-48',
  };

  return (
    <Card
      ref={ref}
      variant="team"
      isLoading={isLoading}
      clickable={Boolean(onClick)}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        sizeClasses[size],
        'h-full transition-all duration-300 overflow-hidden',
        'hover:scale-105 hover:shadow-lg',
        className,
      )}
      ariaLabel={`Team ${name} information card`}
      {...props}
    >
      <CardContent className="p-0 h-full">
        {/* Team Banner/Logo Section */}
        <div className="relative overflow-hidden">
          <div className={cn(
            'relative bg-linear-to-br from-primary/10 to-secondary/10 flex items-center justify-center',
            imageSizeClasses[size],
          )}>
            {/* Background Image */}
            {bannerImage && (
              <img
                src={bannerImage}
                alt={`${name} banner`}
                className={cn(
                  'absolute inset-0 w-full h-full object-cover transition-opacity duration-300',
                  imageLoaded ? 'opacity-100' : 'opacity-0',
                )}
                onLoad={() => setImageLoaded(true)}
                loading="lazy"
              />
            )}

            {/* Team Logo */}
            <div className="relative z-10 w-20 h-20 rounded-full bg-background/90 backdrop-blur-sm border-2 border-primary/20 flex items-center justify-center shadow-lg">
              {logo ? (
                <img
                  src={logo}
                  alt={`${name} logo`}
                  className="w-16 h-16 object-contain rounded-full"
                  loading="lazy"
                />
              ) : (
                <span className="text-2xl font-bold text-primary">
                  {name.charAt(0)}
                </span>
              )}
            </div>

            {/* Hover Overlay */}
            <div className={cn(
              'absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300',
              isHovered ? 'opacity-100' : 'opacity-0',
            )}>
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-white font-bold text-lg mb-1">{name}</h3>
                {captain && (
                  <p className="text-white/90 text-sm">Captain: {captain}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Team Info Section */}
        <div className="p-4 space-y-3">
          <div className="text-center">
            <h3 className="font-bold text-lg text-foreground mb-1">{name}</h3>
            {founded && (
              <p className="text-sm text-muted-foreground">Est. {founded}</p>
            )}
          </div>

          {/* Stats Row */}
          {stats && (
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-lg font-bold text-primary">{stats.wins}</div>
                <div className="text-xs text-muted-foreground">Wins</div>
              </div>
              <div>
                <div className="text-lg font-bold text-secondary">{stats.matches}</div>
                <div className="text-xs text-muted-foreground">Matches</div>
              </div>
              <div>
                <div className="text-lg font-bold text-accent">{stats.winRate}%</div>
                <div className="text-xs text-muted-foreground">Win Rate</div>
              </div>
            </div>
          )}

          {/* Additional Info */}
          <div className="space-y-2">
            {coach && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Coach:</span>
                <span className="font-medium">{coach}</span>
              </div>
            )}
            {players > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Players:</span>
                <span className="font-medium">{players}</span>
              </div>
            )}
          </div>

          {/* Achievements */}
          {achievements.length > 0 && (
            <div className="pt-2 border-t border-border/50">
              <div className="flex flex-wrap gap-1">
                {achievements.slice(0, 2).map((achievement, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {achievement}
                  </Badge>
                ))}
                {achievements.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{achievements.length - 2}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

TeamCard.displayName = 'TeamCard';

export { TeamCard, type TeamCardProps };
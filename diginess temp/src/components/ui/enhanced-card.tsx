import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface EnhancedCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: 'lift' | 'glow' | 'scale' | 'tilt' | 'none';
  interactive?: boolean;
  glass?: boolean;
  gradient?: boolean;
  onClick?: () => void;
}

const EnhancedCard = React.forwardRef<HTMLDivElement, EnhancedCardProps>(
  ({ className, hover = 'lift', interactive = false, glass = false, gradient = false, children, onClick, ...props }, ref) => {
    const [isHovered, setIsHovered] = React.useState(false);

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    const hoverClasses = {
      lift: 'hover:-translate-y-2 hover:shadow-card transition-all duration-300',
      glow: 'hover:shadow-glow transition-all duration-300',
      scale: 'hover:scale-105 transition-all duration-300',
      tilt: 'hover:rotate-1 hover:scale-105 transition-all duration-300',
      none: '',
    };

    const baseClasses = cn(
      'relative overflow-hidden transition-all duration-300',
      hoverClasses[hover],
      interactive && 'cursor-pointer',
      glass && 'bg-white/10 backdrop-blur-xl border-white/20',
      gradient && 'bg-linear-to-br from-white/5 to-white/10',
      className,
    );

    return (
      <Card
        ref={ref}
        className={baseClasses}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
        {...props}
      >
        {/* Animated Background Pattern */}
        {isHovered && (
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-4 right-4 w-16 h-16 bg-cricket-electric-blue rounded-full blur-xl animate-pulse"></div>
            <div className="absolute bottom-4 left-4 w-12 h-12 bg-cricket-purple rounded-full blur-lg animate-pulse animation-delay-[500ms]"></div>
          </div>
        )}

        {/* Shine Effect */}
        <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />

        {/* Border Glow Effect */}
        <div className="absolute inset-0 rounded-lg bg-linear-to-r from-cricket-electric-blue/20 via-transparent to-cricket-purple/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {children}
      </Card>
    );
  },
);

EnhancedCard.displayName = 'EnhancedCard';

// Enhanced Card Components
const EnhancedCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <CardHeader
    ref={ref}
    className={cn('relative z-10', className)}
    {...props}
  />
));

const EnhancedCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <CardTitle
    ref={ref}
    className={cn('group-hover:text-cricket-blue transition-colors duration-300', className)}
    {...props}
  />
));

const EnhancedCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <CardDescription
    ref={ref}
    className={cn('group-hover:text-gray-600 transition-colors duration-300', className)}
    {...props}
  />
));

const EnhancedCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <CardContent
    ref={ref}
    className={cn('relative z-10', className)}
    {...props}
  />
));

const EnhancedCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <CardFooter
    ref={ref}
    className={cn('relative z-10', className)}
    {...props}
  />
));

EnhancedCardHeader.displayName = 'EnhancedCardHeader';
EnhancedCardTitle.displayName = 'EnhancedCardTitle';
EnhancedCardDescription.displayName = 'EnhancedCardDescription';
EnhancedCardContent.displayName = 'EnhancedCardContent';
EnhancedCardFooter.displayName = 'EnhancedCardFooter';

export {
  EnhancedCard,
  EnhancedCardHeader,
  EnhancedCardTitle,
  EnhancedCardDescription,
  EnhancedCardContent,
  EnhancedCardFooter,
  type EnhancedCardProps,
};
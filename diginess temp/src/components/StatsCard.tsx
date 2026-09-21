import * as React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon?: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
    label: string
  }
  format?: 'number' | 'currency' | 'percentage'
  isLoading?: boolean
  onClick?: () => void
  className? : string
  size?: 'xxs' | 'xs' | 'sm' | 'md' | 'lg'
  color?: string // New prop for vibrant tint
}

const StatsCard = React.forwardRef<
  HTMLDivElement,
  StatsCardProps
>(({
  title,
  value,
  description,
  icon,
  trend,
  format = 'number',
  isLoading = false,
  onClick,
  className,
  size = 'md',
  color = '#CCFF00', // Default to Neon Lime
  ...props
}, ref) => {
  const formatValue = (val: string | number) => {
    if (typeof val === 'string' && val.includes('Upto')) return val;
    const num = typeof val === 'string' ? parseFloat(val.replace(/,/g, '')) : val;

    if (isNaN(num as number)) return val;

    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(num as number);
      case 'percentage':
        return `${num}%`;
      default:
        return new Intl.NumberFormat('en-IN').format(num as number);
    }
  };

  const textSizeClasses = {
    xxs: 'text-sm md:text-base',
    xs: 'text-base md:text-lg',
    sm: 'text-lg md:text-xl',
    md: 'text-xl md:text-2xl',
    lg: 'text-2xl md:text-3xl',
  };

  const paddingClasses = {
    xxs: 'p-1.5 md:p-2',
    xs: 'p-2 md:p-2.5',
    sm: 'p-2.5 md:p-3',
    md: 'p-3 md:p-4',
    lg: 'p-4 md:p-6',
  };

  return (
    <motion.div
      ref={ref}
      onClick={onClick}
      className={cn(
        'relative group overflow-hidden rounded-xl transition-all duration-500',
        'bg-white/[0.04] backdrop-blur-2xl border border-white/10',
        'hover:bg-white/[0.06] hover:border-white/20',
        onClick && 'cursor-pointer',
        className
      )}
      style={{
        boxShadow: `0 4px 20px -4px rgba(0,0,0,0.5), 0 0 10px -5px ${color}20`,
      }}
      {...props}
    >
      {/* Dynamic Border Accent */}
      <div 
        className="absolute inset-x-0 bottom-0 h-[1.5px] opacity-20 group-hover:opacity-60 transition-opacity duration-500"
        style={{ backgroundColor: color }}
      />

      {/* Background Glow Tint */}
      <div 
        className="absolute inset-0 opacity-[0.03] transition-opacity duration-700 pointer-events-none"
        style={{ backgroundColor: color }}
      />

      <div className={cn(
        "relative flex flex-col items-center text-center justify-center h-full z-10 space-y-1.5",
        paddingClasses[size]
      )}>
        <div className="flex flex-col items-center space-y-0.5">
          <h3 
            className="text-[7px] md:text-[8px] font-black uppercase tracking-[0.2em] font-sans"
            style={{ color }}
          >
            {title}
          </h3>

          <div className={cn(
            'font-black tracking-tighter leading-tight font-numbers text-white',
            textSizeClasses[size]
          )}>
            {formatValue(value)}
          </div>
        </div>

        {icon && (
          <div 
            className={cn(
              "opacity-100 transition-all duration-500 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] pt-0.5",
              size === 'xxs' || size === 'xs' ? 'scale-[0.85]' : 'scale-[1.1]'
            )}
            style={{ color }}
          >
            {icon}
          </div>
        )}

        {description && (
          <p className="mt-1 text-[6px] md:text-[7px] text-white/40 leading-tight font-bold uppercase tracking-wider">
            {description}
          </p>
        )}
      </div>

      {/* Decorative Energy Corner */}
      <div 
        className="absolute top-0 right-0 w-8 h-8 opacity-10 blur-lg pointer-events-none"
        style={{ 
          background: `radial-gradient(circle at top right, ${color}, transparent)` 
        }}
      />
    </motion.div>
  );
});

StatsCard.displayName = 'StatsCard';

export { StatsCard, type StatsCardProps };
import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface EnhancedTooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  delayDuration?: number;
  className?: string;
  contentClassName?: string;
  variant?: 'default' | 'cricket' | 'glass' | 'minimal';
  animated?: boolean;
  interactive?: boolean;
}

const EnhancedTooltip = React.forwardRef<HTMLButtonElement, EnhancedTooltipProps>(
  ({
    children,
    content,
    side = 'top',
    align = 'center',
    delayDuration = 300,
    className,
    contentClassName,
    variant = 'default',
    animated = true,
    interactive = false,
    ...props
  }, ref) => {
    const [isVisible, setIsVisible] = React.useState(false);

    const variantClasses = {
      default: 'bg-gray-900 text-white border-gray-700',
      cricket: 'bg-gradient-primary text-white border-cricket-blue',
      glass: 'bg-white text-gray-900 border-gray-200 shadow-card',
      minimal: 'bg-gray-100 text-gray-900 border-gray-300',
    };

    const animationClasses = animated ? 'animate-fade-in scale-95 data-[state=open]:scale-100' : '';

    return (
      <TooltipProvider delayDuration={delayDuration}>
        <Tooltip>
          <TooltipTrigger
            ref={ref}
            className={cn(
              'inline-flex items-center justify-center',
              interactive && 'cursor-pointer',
              className,
            )}
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
            {...props}
          >
            {children}
          </TooltipTrigger>

          <TooltipContent
            side={side}
            align={align}
            className={cn(
              'relative z-50 max-w-xs px-3 py-2 text-sm font-medium rounded-lg border shadow-lg',
              variantClasses[variant],
              animationClasses,
              'transition-all duration-200 ease-out',
              contentClassName,
            )}
            sideOffset={8}
          >
            {/* Arrow Pointer */}
            <div className={cn(
              'absolute w-2 h-2 rotate-45',
              variant === 'default' && 'bg-gray-900 border-r border-b border-gray-700',
              variant === 'cricket' && 'bg-gradient-primary border-r border-b border-cricket-blue',
              variant === 'glass' && 'bg-white border-r border-b border-gray-200',
              variant === 'minimal' && 'bg-gray-100 border-r border-b border-gray-300',
              side === 'top' && '-bottom-1 left-1/2 transform -translate-x-1/2',
              side === 'bottom' && '-top-1 left-1/2 transform -translate-x-1/2',
              side === 'left' && '-right-1 top-1/2 transform -translate-y-1/2',
              side === 'right' && '-left-1 top-1/2 transform -translate-y-1/2',
            )} />

            {/* Content */}
            <div className="relative z-10">
              {content}
            </div>

            {/* Shine Effect */}
            {animated && isVisible && (
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shine rounded-lg" />
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  },
);

EnhancedTooltip.displayName = 'EnhancedTooltip';

// Enhanced Tooltip with Icon
interface TooltipWithIconProps extends Omit<EnhancedTooltipProps, 'children'> {
  icon: React.ReactNode;
  text?: string;
  iconClassName?: string;
}

const TooltipWithIcon = React.forwardRef<HTMLButtonElement, TooltipWithIconProps>(
  ({ icon, text, content, iconClassName, ...props }, ref) => {
    return (
      <EnhancedTooltip
        ref={ref}
        content={content}
        {...props}
      >
        <div className="inline-flex items-center gap-2 group">
          <span className={cn(
            'transition-all duration-200 group-hover:scale-110',
            iconClassName,
          )}>
            {icon}
          </span>
          {text && (
            <span className="text-sm font-medium group-hover:text-cricket-blue transition-colors duration-200">
              {text}
            </span>
          )}
        </div>
      </EnhancedTooltip>
    );
  },
);

TooltipWithIcon.displayName = 'TooltipWithIcon';

// Enhanced Info Tooltip
interface InfoTooltipProps extends Omit<EnhancedTooltipProps, 'children' | 'content' | 'variant'> {
  title: string;
  description?: string;
  shortcut?: string;
  variant?: 'info' | 'warning' | 'success' | 'error';
}

const InfoTooltip = React.forwardRef<HTMLButtonElement, InfoTooltipProps>(
  ({ title, description, shortcut, variant = 'info', ...props }, ref) => {
    const variantStyles = {
      info: {
        icon: 'ℹ️',
        bgColor: 'bg-blue-50 border-blue-200',
        textColor: 'text-blue-900',
        iconColor: 'text-blue-600',
      },
      warning: {
        icon: '⚠️',
        bgColor: 'bg-yellow-50 border-yellow-200',
        textColor: 'text-yellow-900',
        iconColor: 'text-yellow-600',
      },
      success: {
        icon: '✅',
        bgColor: 'bg-green-50 border-green-200',
        textColor: 'text-green-900',
        iconColor: 'text-green-600',
      },
      error: {
        icon: '❌',
        bgColor: 'bg-red-50 border-red-200',
        textColor: 'text-red-900',
        iconColor: 'text-red-600',
      },
    };

    const style = variantStyles[variant];

    return (
      <EnhancedTooltip
        ref={ref}
        variant="glass"
        content={
          <div className={cn('p-3 rounded-lg max-w-sm', style.bgColor)}>
            <div className="flex items-start gap-3">
              <span className={cn('text-lg shrink-0', style.iconColor)}>
                {style.icon}
              </span>
              <div className="flex-1 min-w-0">
                <h4 className={cn('font-semibold text-sm mb-1', style.textColor)}>
                  {title}
                </h4>
                {description && (
                  <p className={cn('text-xs opacity-90', style.textColor)}>
                    {description}
                  </p>
                )}
                {shortcut && (
                  <div className="mt-2">
                    <kbd className="px-2 py-1 text-xs bg-black/10 rounded border">
                      {shortcut}
                    </kbd>
                  </div>
                )}
              </div>
            </div>
          </div>
        }
        {...props}
      >
        <span className={cn('inline-block w-4 h-4 rounded-full cursor-help', style.iconColor)}>
          {style.icon}
        </span>
      </EnhancedTooltip>
    );
  },
);

InfoTooltip.displayName = 'InfoTooltip';

export {
  EnhancedTooltip,
  TooltipWithIcon,
  InfoTooltip,
  type EnhancedTooltipProps,
  type TooltipWithIconProps,
  type InfoTooltipProps,
};
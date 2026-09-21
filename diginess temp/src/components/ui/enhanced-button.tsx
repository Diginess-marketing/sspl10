import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EnhancedButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'cricket' | 'glow' | 'bounce';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children: React.ReactNode;
  ripple?: boolean;
  magnetic?: boolean;
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

const EnhancedButton = React.forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  ({ className, variant = 'default', size = 'default', ripple = true, magnetic = false, children, ...props }, ref) => {
    const [ripples, setRipples] = React.useState<Array<{ id: number; x: number; y: number }>>([]);
    const buttonRef = React.useRef<HTMLButtonElement>(null);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (ripple) {
        const button = buttonRef.current;
        if (button) {
          requestAnimationFrame(() => {
            const rect = button.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            const newRipple = { id: Date.now(), x, y };
            setRipples(prev => [...prev, newRipple]);

            setTimeout(() => {
              setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
            }, 600);
          });
        }
      }

      props.onClick?.(event);
    };

    const handleMouseMove = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (magnetic && buttonRef.current) {
        const button = buttonRef.current;
        requestAnimationFrame(() => {
          const rect = button.getBoundingClientRect();
          const x = event.clientX - rect.left - rect.width / 2;
          const y = event.clientY - rect.top - rect.height / 2;

          button.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
        });
      }
    };

    const handleMouseLeave = () => {
      if (magnetic && buttonRef.current) {
        buttonRef.current.style.transform = 'translate(0, 0)';
      }
    };

    const baseClasses = 'relative overflow-hidden transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-cricket-blue focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variantClasses = {
      default: 'bg-gradient-primary text-white hover:shadow-card hover:scale-105 active:scale-95',
      destructive: 'bg-red-500 text-white hover:bg-red-600 hover:shadow-lg hover:scale-105 active:scale-95',
      outline: 'border-2 border-cricket-blue text-cricket-blue hover:bg-cricket-blue hover:text-white hover:shadow-lg hover:scale-105 active:scale-95',
      secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 hover:shadow-md hover:scale-105 active:scale-95',
      ghost: 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:scale-105 active:scale-95',
      link: 'text-cricket-blue hover:text-cricket-dark-blue underline-offset-4 hover:underline hover:scale-105 active:scale-95',
      cricket: 'bg-[#C1E303] text-black hover:bg-[#C1E303]/90 hover:shadow-lg hover:scale-105 active:scale-95 border border-black/20',
      glow: 'bg-gradient-energy text-white hover:shadow-glow hover:scale-105 active:scale-95 animate-pulse-glow',
      bounce: 'bg-gradient-accent text-white hover:shadow-card hover:scale-105 active:scale-95 hover:animate-cricket-bounce',
    };

    const sizeClasses = {
      default: 'px-6 py-3 text-sm font-medium rounded-lg',
      sm: 'px-4 py-2 text-xs font-medium rounded-md',
      lg: 'px-8 py-4 text-base font-semibold rounded-xl',
      icon: 'p-3 rounded-lg',
    };

    return (
      <Button
        ref={(node) => {
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
          buttonRef.current = node;
        }}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {children}

        {/* Ripple Effects */}
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="absolute rounded-full bg-white/30 animate-ping"
            style={{
              left: ripple.x - 10,
              top: ripple.y - 10,
              width: 20,
              height: 20,
            }}
          />
        ))}

        {/* Shine Effect */}
        <span className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
      </Button>
    );
  },
);

EnhancedButton.displayName = 'EnhancedButton';

export { EnhancedButton, type EnhancedButtonProps };
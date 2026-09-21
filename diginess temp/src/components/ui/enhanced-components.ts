// Enhanced UI Components Library
// Export all enhanced components for easy importing

export {
  EnhancedButton,
  type EnhancedButtonProps,
} from './enhanced-button';

export {
  EnhancedCard,
  EnhancedCardHeader,
  EnhancedCardTitle,
  EnhancedCardDescription,
  EnhancedCardContent,
  EnhancedCardFooter,
  type EnhancedCardProps,
} from './enhanced-card';

export {
  EnhancedInput,
  type EnhancedInputProps,
} from './enhanced-input';

export {
  Skeleton,
  LoadingSpinner,
  CardSkeleton,
  TableSkeleton,
  LoadingOverlay,
  type SkeletonProps,
  type LoadingSpinnerProps,
  type CardSkeletonProps,
  type TableSkeletonProps,
  type LoadingOverlayProps,
} from './enhanced-loading';

export {
  EnhancedTooltip,
  TooltipWithIcon,
  InfoTooltip,
  type EnhancedTooltipProps,
  type TooltipWithIconProps,
  type InfoTooltipProps,
} from './enhanced-tooltip';

// Component Showcase Examples
export const EnhancedComponents = {
  // Button variants
  buttons: {
    cricket: 'bg-[#C1E303] text-black hover:bg-[#C1E303]/90',
    glow: 'bg-gradient-energy text-white hover:shadow-glow',
    bounce: 'bg-gradient-accent text-white hover:animate-cricket-bounce',
    ripple: 'with ripple effect on click',
    magnetic: 'follows cursor on hover',
  },

  // Card variants
  cards: {
    lift: 'hover:-translate-y-2 hover:shadow-card',
    glow: 'hover:shadow-glow',
    scale: 'hover:scale-105',
    tilt: 'hover:rotate-1 hover:scale-105',
    glass: 'bg-white/10 backdrop-blur-xl',
    gradient: 'bg-linear-to-br from-white/5 to-white/10',
  },

  // Input features
  inputs: {
    floatingLabel: 'animated floating labels',
    validation: 'real-time validation feedback',
    passwordToggle: 'show/hide password',
    icons: 'left and right icon support',
    status: 'success, error, warning states',
  },

  // Loading components
  loading: {
    spinner: 'multi-ring animated spinner',
    skeleton: 'card, table, and custom skeletons',
    overlay: 'loading overlay with backdrop blur',
    text: 'loading text with animations',
  },

  // Tooltip variants
  tooltips: {
    cricket: 'cricket-themed styling',
    glass: 'backdrop blur effect',
    minimal: 'clean minimal design',
    info: 'pre-styled info, warning, success variants',
    animated: 'shine effects and animations',
  },
};
import React from 'react';
import { Check, Circle, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressStep {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'current' | 'completed' | 'error';
  icon?: React.ReactNode;
}

interface EnhancedProgressProps {
  steps: ProgressStep[];
  currentStep?: string;
  orientation?: 'horizontal' | 'vertical';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showDescriptions?: boolean;
  className?: string;
  onStepClick?: (step: ProgressStep) => void;
}

const EnhancedProgress: React.FC<EnhancedProgressProps> = ({
  steps,
  currentStep,
  orientation = 'horizontal',
  size = 'md',
  showDescriptions = true,
  className = '',
  onStepClick,
}) => {
  const getStepIcon = (step: ProgressStep) => {
    if (step.icon) return step.icon;

    switch (step.status) {
      case 'completed':
        return <Check className="w-full h-full" />;
      case 'error':
        return <AlertCircle className="w-full h-full" />;
      case 'current':
        return <Clock className="w-full h-full" />;
      default:
        return <Circle className="w-full h-full" />;
    }
  };

  const getStepColors = (step: ProgressStep) => {
    switch (step.status) {
      case 'completed':
        return {
          icon: 'bg-gradient-accent text-white',
          border: 'border-cricket-electric-blue',
          text: 'text-cricket-electric-blue',
          connector: 'bg-gradient-accent',
        };
      case 'current':
        return {
          icon: 'bg-gradient-primary text-white animate-pulse',
          border: 'border-cricket-blue',
          text: 'text-cricket-blue',
          connector: 'bg-gradient-primary',
        };
      case 'error':
        return {
          icon: 'bg-red-500 text-white',
          border: 'border-red-500',
          text: 'text-red-600',
          connector: 'bg-red-500',
        };
      default:
        return {
          icon: 'bg-gray-200 text-gray-400',
          border: 'border-gray-300',
          text: 'text-gray-500',
          connector: 'bg-gray-300',
        };
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'xs':
        return {
          container: 'gap-3',
          icon: 'w-5 h-5',
          text: 'text-xs',
          description: 'text-xs',
        };
      case 'sm':
        return {
          container: 'gap-4',
          icon: 'w-6 h-6',
          text: 'text-sm',
          description: 'text-xs',
        };
      case 'lg':
        return {
          container: 'gap-8',
          icon: 'w-10 h-10',
          text: 'text-lg',
          description: 'text-sm',
        };
      default:
        return {
          container: 'gap-6',
          icon: 'w-8 h-8',
          text: 'text-base',
          description: 'text-sm',
        };
    }
  };

  const sizeClasses = getSizeClasses();
  const isHorizontal = orientation === 'horizontal';

  return (
    <div className={cn(
      'w-full',
      isHorizontal ? 'flex items-center' : 'flex flex-col items-start',
      sizeClasses.container,
      className,
    )}>
      {steps.map((step, index) => {
        const colors = getStepColors(step);
        const isLast = index === steps.length - 1;
        const isClickable = onStepClick && (step.status === 'completed' || step.status === 'current');

        return (
          <React.Fragment key={step.id}>
            {/* Step Item */}
            <div className={cn(
              'flex items-center',
              isHorizontal ? 'flex-col text-center' : 'flex-row',
              'relative',
            )}>
              {/* Step Circle */}
              <div
                className={cn(
                  'rounded-full border-2 flex items-center justify-center transition-all duration-300',
                  sizeClasses.icon,
                  colors.icon,
                  colors.border,
                  isClickable && 'cursor-pointer hover:scale-110',
                  step.status === 'current' && 'ring-4 ring-cricket-blue/20',
                )}
                onClick={() => isClickable && onStepClick(step)}
              >
                {getStepIcon(step)}
              </div>

              {/* Step Content */}
              <div className={cn(
                'mt-2',
                isHorizontal ? 'text-center' : 'ml-4',
              )}>
                <h3 className={cn(
                  'font-semibold transition-colors duration-300',
                  sizeClasses.text,
                  colors.text,
                )}>
                  {step.title}
                </h3>
                {showDescriptions && step.description && (
                  <p className={cn(
                    'text-gray-600 mt-1 transition-colors duration-300',
                    sizeClasses.description,
                    step.status === 'pending' && 'text-gray-400',
                  )}>
                    {step.description}
                  </p>
                )}
              </div>
            </div>

            {/* Connector Line */}
            {!isLast && (
              <div className={cn(
                'transition-colors duration-300',
                isHorizontal
                  ? 'flex-1 h-0.5 mx-4'
                  : 'w-0.5 h-8 ml-4',
                colors.connector,
              )} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// Pre-configured progress components for common use cases
export const RegistrationProgress: React.FC<{
  currentStep: number;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}> = ({ currentStep, className, size = 'md' }) => {
  const steps: ProgressStep[] = [
    {
      id: 'personal',
      title: 'Personal Info',
      description: 'Basic information',
      status: currentStep > 0 ? 'completed' : currentStep === 0 ? 'current' : 'pending',
    },
    {
      id: 'team',
      title: 'Team Selection',
      description: 'Choose your team',
      status: currentStep > 1 ? 'completed' : currentStep === 1 ? 'current' : 'pending',
    },
    {
      id: 'payment',
      title: 'Payment',
      description: 'Complete registration',
      status: currentStep > 2 ? 'completed' : currentStep === 2 ? 'current' : 'pending',
    },
    {
      id: 'confirmation',
      title: 'Confirmation',
      description: 'Registration complete',
      status: currentStep > 3 ? 'completed' : currentStep === 3 ? 'current' : 'pending',
    },
  ];

  return (
    <EnhancedProgress
      steps={steps}
      orientation="horizontal"
      size={size}
      showDescriptions={false}
      className={cn('mb-6', className)}
    />
  );
};

export const CheckoutProgress: React.FC<{
  currentStep: number;
  className?: string;
}> = ({ currentStep, className }) => {
  const steps: ProgressStep[] = [
    {
      id: 'cart',
      title: 'Cart',
      description: 'Review items',
      status: currentStep > 0 ? 'completed' : currentStep === 0 ? 'current' : 'pending',
    },
    {
      id: 'shipping',
      title: 'Shipping',
      description: 'Delivery details',
      status: currentStep > 1 ? 'completed' : currentStep === 1 ? 'current' : 'pending',
    },
    {
      id: 'payment',
      title: 'Payment',
      description: 'Payment method',
      status: currentStep > 2 ? 'completed' : currentStep === 2 ? 'current' : 'pending',
    },
    {
      id: 'confirmation',
      title: 'Confirmation',
      description: 'Order complete',
      status: currentStep > 3 ? 'completed' : currentStep === 3 ? 'current' : 'pending',
    },
  ];

  return (
    <EnhancedProgress
      steps={steps}
      orientation="horizontal"
      size="md"
      className={cn('mb-8', className)}
    />
  );
};

export const OnboardingProgress: React.FC<{
  currentStep: number;
  totalSteps: number;
  className?: string;
}> = ({ currentStep, totalSteps, className }) => {
  const steps: ProgressStep[] = Array.from({ length: totalSteps }, (_, index) => ({
    id: `step-${index + 1}`,
    title: `Step ${index + 1}`,
    description: `Step ${index + 1} of ${totalSteps}`,
    status: index < currentStep ? 'completed' : index === currentStep ? 'current' : 'pending',
  }));

  return (
    <EnhancedProgress
      steps={steps}
      orientation="horizontal"
      size="sm"
      showDescriptions={false}
      className={cn('mb-6', className)}
    />
  );
};

export default EnhancedProgress;
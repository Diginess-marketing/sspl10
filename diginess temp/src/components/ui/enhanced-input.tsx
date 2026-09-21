import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface EnhancedInputProps {
  label?: string;
  error?: string;
  success?: string;
  warning?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
  className?: string;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  floatingLabel?: boolean;
  animated?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  value?: string;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  name?: string;
  min?: string;
  max?: string;
  step?: string;
  pattern?: string;
}

const EnhancedInput = React.forwardRef<HTMLInputElement, EnhancedInputProps>(
  ({
    label,
    error,
    success,
    warning,
    helperText,
    leftIcon,
    rightIcon,
    showPasswordToggle = false,
    className,
    containerClassName,
    labelClassName,
    inputClassName,
    floatingLabel = false,
    animated = true,
    ...props
  }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [showPassword, setShowPassword] = React.useState(false);

    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useImperativeHandle(ref, () => inputRef.current!);

    const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      props.onFocus?.(event);
    };

    const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      props.onBlur?.(event);
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      props.onChange?.(event);
    };

    const inputType = showPasswordToggle && showPassword ? 'text' : props.type;

    const hasError = Boolean(error);
    const hasSuccess = Boolean(success);
    const hasWarning = Boolean(warning);

    const getStatusIcon = () => {
      if (hasError) return <XCircle className="w-4 h-4 text-red-500" />;
      if (hasSuccess) return <CheckCircle className="w-4 h-4 text-green-500" />;
      if (hasWarning) return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      return rightIcon;
    };

    const getStatusColor = () => {
      if (hasError) return 'border-red-500 focus:border-red-500 focus:ring-red-500/20';
      if (hasSuccess) return 'border-green-500 focus:border-green-500 focus:ring-green-500/20';
      if (hasWarning) return 'border-yellow-500 focus:border-yellow-500 focus:ring-yellow-500/20';
      return 'border-gray-300 focus:border-cricket-blue focus:ring-cricket-blue/20';
    };

    return (
      <div className={cn('relative', containerClassName)}>
        {/* Label */}
        {label && !floatingLabel && (
          <Label
            htmlFor={props.id}
            className={cn(
              'block text-sm font-medium mb-2 transition-colors duration-200',
              hasError && 'text-red-600',
              hasSuccess && 'text-green-600',
              hasWarning && 'text-yellow-600',
              !hasError && !hasSuccess && !hasWarning && 'text-gray-700',
              labelClassName,
            )}
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">
              {leftIcon}
            </div>
          )}

          {/* Input */}
          <Input
            ref={inputRef}
            type={inputType}
            className={cn(
              'transition-all duration-300 ease-out',
              'bg-white/80 backdrop-blur-sm',
              'placeholder:text-gray-400',
              animated && 'hover:shadow-md focus:shadow-lg',
              getStatusColor(),
              leftIcon && 'pl-10',
              (rightIcon || getStatusIcon() || showPasswordToggle) && 'pr-10',
              hasError && 'text-red-900',
              hasSuccess && 'text-green-900',
              hasWarning && 'text-yellow-900',
              inputClassName,
            )}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            {...props}
          />

          {/* Floating Label */}
          {label && floatingLabel && (
            <Label
              htmlFor={props.id}
              className={cn(
                'absolute left-3 transition-all duration-200 pointer-events-none',
                leftIcon && 'left-10',
                (isFocused || props.value) ? 'top-1 text-xs text-cricket-blue' : 'top-1/2 -translate-y-1/2 text-sm text-gray-500',
                hasError && isFocused && 'text-red-600',
                hasSuccess && isFocused && 'text-green-600',
                hasWarning && isFocused && 'text-yellow-600',
                labelClassName,
              )}
            >
              {label}
              {props.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
          )}

          {/* Right Icon / Status Icon */}
          {(rightIcon || getStatusIcon() || showPasswordToggle) && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2 z-10">
              {showPasswordToggle && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              )}
              {getStatusIcon()}
            </div>
          )}

          {/* Focus Ring Animation */}
          {animated && isFocused && (
            <div className="absolute inset-0 rounded-md bg-linear-to-r from-cricket-electric-blue/20 to-cricket-purple/20 animate-pulse" />
          )}
        </div>

        {/* Helper Text / Error Message */}
        {(helperText || error || success || warning) && (
          <div className={cn(
            'mt-2 text-sm transition-all duration-200',
            hasError && 'text-red-600',
            hasSuccess && 'text-green-600',
            hasWarning && 'text-yellow-600',
            !hasError && !hasSuccess && !hasWarning && 'text-gray-500',
          )}>
            {error || success || warning || helperText}
          </div>
        )}

        {/* Success Animation */}
        {hasSuccess && animated && (
          <div className="absolute right-2 top-2 w-2 h-2 bg-green-500 rounded-full animate-ping" />
        )}
      </div>
    );
  },
);

EnhancedInput.displayName = 'EnhancedInput';

export { EnhancedInput, type EnhancedInputProps };
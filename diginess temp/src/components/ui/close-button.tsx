import React from 'react';
import { X } from 'lucide-react';
import { Button } from './button';

interface CloseButtonProps {
  onClick: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'ghost' | 'outline';
}

export const CloseButton: React.FC<CloseButtonProps> = ({
  onClick,
  className = '',
  size = 'sm',
  variant = 'ghost',
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <Button
      variant={variant}
      size="sm"
      onClick={onClick}
      className={`absolute top-2 right-2 z-10 p-1 hover:bg-red-100 hover:text-red-600 transition-colors ${sizeClasses[size]} ${className}`}
      aria-label="Close"
    >
      <X className={iconSizes[size]} />
    </Button>
  );
};
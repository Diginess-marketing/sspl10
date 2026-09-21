import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  dismissible?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationSystemProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center';
  maxNotifications?: number;
  enableClickOutside?: boolean;
  enableEscapeKey?: boolean;
}

const NotificationSystem = ({
  position = 'top-right',
  maxNotifications = 5,
  enableClickOutside = true,
  enableEscapeKey = true,
}: NotificationSystemProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Handle ESC key to dismiss notifications
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape' && enableEscapeKey) {
      setNotifications([]);
    }
  }, [enableEscapeKey]);

  // Handle click outside to dismiss notification
  const handleBackdropClick = useCallback((event: React.MouseEvent, notificationId: string) => {
    if (enableClickOutside && event.target === event.currentTarget) {
      removeNotification(notificationId);
    }
  }, [enableClickOutside]);

  // Add keyboard event listener
  useEffect(() => {
    if (enableEscapeKey) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown, enableEscapeKey]);

  // Auto-remove notifications after duration with improved timing
  useEffect(() => {
    notifications.forEach((notification) => {
      if (notification.duration !== 0 && notification.dismissible !== false) {
        const timer = setTimeout(() => {
          removeNotification(notification.id);
        }, notification.duration || 7000); // Increased default duration to 7 seconds

        return () => clearTimeout(timer);
      }
    });
  }, [notifications]);

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString();
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration ?? 7000, // Default 7 seconds for better readability
      dismissible: notification.dismissible !== false, // Default to true unless explicitly set to false
    };

    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      return updated.slice(0, maxNotifications);
    });

    return id;
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info': return <Info className="w-5 h-5 text-blue-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-400';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800 dark:bg-gray-900/20 dark:border-gray-800 dark:text-gray-400';
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-right': return 'top-4 right-4';
      case 'top-left': return 'top-4 left-4';
      case 'bottom-right': return 'bottom-4 right-4';
      case 'bottom-left': return 'bottom-4 left-4';
      case 'top-center': return 'top-4 left-1/2 transform -translate-x-1/2';
      default: return 'top-4 right-4';
    }
  };

  // Expose addNotification function globally for easy access
  useEffect(() => {
    (window as any).showNotification = addNotification;
    return () => {
      delete (window as any).showNotification;
    };
  }, []);

  if (notifications.length === 0) return null;

  return (
    <div className={`fixed z-50 space-y-3 ${getPositionClasses()}`}>
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`relative max-w-sm w-full p-4 rounded-lg border shadow-lg transform transition-all duration-500 ease-out animate-in slide-in-from-right-2 hover:scale-105 hover:shadow-xl cursor-pointer ${getStyles(notification.type)} ${
            enableClickOutside ? 'cursor-pointer' : ''
          }`}
          onClick={enableClickOutside ? (e) => handleBackdropClick(e, notification.id) : undefined}
          role="alert"
          aria-live="polite"
          aria-label={`${notification.type} notification: ${notification.title}`}
        >
          <div className="flex items-start gap-3">
            <div className="shrink-0 mt-0.5">
              {getIcon(notification.type)}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold leading-tight">
                {notification.title}
              </h4>

              {notification.message && (
                <p className="text-sm opacity-90 mt-1 leading-relaxed">
                  {notification.message}
                </p>
              )}

              {notification.action && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering backdrop click
                    notification.action!.onClick();
                  }}
                  className="mt-3 h-7 px-3 text-xs border-current hover:bg-current hover:text-white focus:ring-2 focus:ring-offset-2 focus:ring-current"
                >
                  {notification.action.label}
                </Button>
              )}
            </div>

            {notification.dismissible !== false && (
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering backdrop click
                  removeNotification(notification.id);
                }}
                className="shrink-0 h-6 w-6 p-0 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-all duration-200 hover:scale-110"
                aria-label="Dismiss notification (Click outside or press ESC)"
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>

          {/* Enhanced progress bar for auto-dismiss */}
          {notification.duration && notification.duration > 0 && notification.dismissible !== false && (
            <div className="mt-3 h-1.5 bg-current/20 rounded-full overflow-hidden">
              <div
                className={`h-full bg-current animate-progress opacity-80 animation-duration-[${notification.duration}ms] [animation-timing-function:linear]`}
              />
            </div>
          )}

          {/* Click outside hint for accessibility */}
          {enableClickOutside && notification.dismissible !== false && (
            <div className="absolute -bottom-5 left-0 text-xs text-gray-400 opacity-60">
              Click outside to dismiss
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Utility functions for easy notification creation with improved options
export const showSuccessNotification = (title: string, message?: string, duration?: number, options?: { dismissible?: boolean }) => {
  (window as any).showNotification?.({
    type: 'success',
    title,
    message,
    duration: duration ?? 7000, // Default 7 seconds for better readability
    dismissible: options?.dismissible ?? true,
  });
};

export const showErrorNotification = (title: string, message?: string, duration?: number, options?: { dismissible?: boolean }) => {
  (window as any).showNotification?.({
    type: 'error',
    title,
    message,
    duration: duration ?? 8000, // Longer duration for error messages
    dismissible: options?.dismissible ?? true,
  });
};

export const showWarningNotification = (title: string, message?: string, duration?: number, options?: { dismissible?: boolean }) => {
  (window as any).showNotification?.({
    type: 'warning',
    title,
    message,
    duration: duration ?? 7500, // Medium duration for warnings
    dismissible: options?.dismissible ?? true,
  });
};

export const showInfoNotification = (title: string, message?: string, duration?: number, options?: { dismissible?: boolean }) => {
  (window as any).showNotification?.({
    type: 'info',
    title,
    message,
    duration: duration ?? 6000, // Shorter duration for info messages
    dismissible: options?.dismissible ?? true,
  });
};

// New non-dismissible notification functions for critical system messages
export const showPersistentNotification = (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => {
  (window as any).showNotification?.({
    type,
    title,
    message,
    duration: 0, // 0 means no auto-dismiss
    dismissible: false,
  });
};

export default NotificationSystem;
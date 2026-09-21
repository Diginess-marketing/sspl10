type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: string;
  userAgent?: string;
  url?: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private logQueue: LogEntry[] = [];
  private maxQueueSize = 50;

  private createLogEntry(level: LogLevel, message: string, data?: any): LogEntry {
    return {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };
  }

  private log(level: LogLevel, message: string, data?: any) {
    const entry = this.createLogEntry(level, message, data);

    // Add to queue for potential batch sending
    this.logQueue.push(entry);
    if (this.logQueue.length > this.maxQueueSize) {
      this.logQueue.shift();
    }

    // Console logging in development
    if (this.isDevelopment) {
      const logMethod = level === 'debug' ? 'debug' :
                       level === 'info' ? 'info' :
                       level === 'warn' ? 'warn' : 'error';

      console[logMethod](`[${level.toUpperCase()}] ${message}`, data || '');
    }

    // In production, you could send to a logging service
    if (!this.isDevelopment && level === 'error') {
      this.sendToLoggingService(entry);
    }
  }

  private async sendToLoggingService(entry: LogEntry) {
    try {
      // This could be replaced with actual logging service calls
      // For now, we'll just store in localStorage for debugging
      const logs = JSON.parse(localStorage.getItem('app_logs') || '[]');
      logs.push(entry);
      if (logs.length > 100) logs.shift(); // Keep only last 100 logs
      localStorage.setItem('app_logs', JSON.stringify(logs));
    } catch (error) {
      // Silent fail to avoid infinite loops
    }
  }

  debug(message: string, data?: any) {
    this.log('debug', message, data);
  }

  info(message: string, data?: any) {
    this.log('info', message, data);
  }

  warn(message: string, data?: any) {
    this.log('warn', message, data);
  }

  error(message: string, data?: any) {
    this.log('error', message, data);
  }

  // Get recent logs (useful for debugging)
  getRecentLogs(): LogEntry[] {
    return [...this.logQueue];
  }

  // Clear logs
  clearLogs() {
    this.logQueue = [];
    if (!this.isDevelopment) {
      localStorage.removeItem('app_logs');
    }
  }
}

export const logger = new Logger();

// React error boundary integration
export const logReactError = (error: Error, errorInfo: any) => {
  logger.error('React Error Boundary', {
    error: error.message,
    stack: error.stack,
    componentStack: errorInfo.componentStack,
  });
};

// Performance logging
export const logPerformance = (metric: string, value: number, data?: any) => {
  logger.info(`Performance: ${metric}`, { value, ...data });
};

// User action logging
export const logUserAction = (action: string, data?: any) => {
  logger.info(`User Action: ${action}`, data);
};

// State management utilities
export class StateManager {
  private static readonly STORAGE_KEYS = {
    AUTH_TOKEN: 'supabase.auth.token',
    USER_PREFERENCES: 'user.preferences',
    APP_STATE: 'app.state',
  };

  // Safe localStorage operations with error handling
  static safeSetItem(key: string, value: string): boolean {
    try {
      localStorage.setItem(key, value);
      logger.debug('StateManager: Successfully stored item', { key });
      return true;
    } catch (error) {
      logger.error('StateManager: Failed to store item in localStorage', {
        key,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  static safeGetItem(key: string): string | null {
    try {
      const value = localStorage.getItem(key);
      logger.debug('StateManager: Retrieved item from localStorage', { key, hasValue: Boolean(value) });
      return value;
    } catch (error) {
      logger.error('StateManager: Failed to retrieve item from localStorage', {
        key,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  }

  static safeRemoveItem(key: string): boolean {
    try {
      localStorage.removeItem(key);
      logger.debug('StateManager: Successfully removed item', { key });
      return true;
    } catch (error) {
      logger.error('StateManager: Failed to remove item from localStorage', {
        key,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  // Safe sessionStorage operations
  static safeSetSessionItem(key: string, value: string): boolean {
    try {
      sessionStorage.setItem(key, value);
      logger.debug('StateManager: Successfully stored session item', { key });
      return true;
    } catch (error) {
      logger.error('StateManager: Failed to store item in sessionStorage', {
        key,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  static safeGetSessionItem(key: string): string | null {
    try {
      const value = sessionStorage.getItem(key);
      logger.debug('StateManager: Retrieved session item', { key, hasValue: Boolean(value) });
      return value;
    } catch (error) {
      logger.error('StateManager: Failed to retrieve item from sessionStorage', {
        key,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  }

  static safeRemoveSessionItem(key: string): boolean {
    try {
      sessionStorage.removeItem(key);
      logger.debug('StateManager: Successfully removed session item', { key });
      return true;
    } catch (error) {
      logger.error('StateManager: Failed to remove item from sessionStorage', {
        key,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  // Clear all auth-related storage
  static clearAuthStorage(): void {
    logger.info('StateManager: Clearing all auth storage');

    const success1 = this.safeRemoveItem(this.STORAGE_KEYS.AUTH_TOKEN);
    const success2 = this.safeRemoveSessionItem(this.STORAGE_KEYS.AUTH_TOKEN);

    if (success1 || success2) {
      logger.info('StateManager: Auth storage cleared successfully');
    } else {
      logger.warn('StateManager: Failed to clear auth storage');
    }
  }

  // Check if storage is available
  static isStorageAvailable(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  // Debounced state updates to prevent excessive re-renders
  static debounce<T extends(...args: any[]) => void>(
    func: T,
    wait: number,
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;

    return (...args: Parameters<T>) => {
      if (timeout) {
        clearTimeout(timeout);
      }

      timeout = setTimeout(() => {
        func(...args);
      }, wait);
    };
  }
}
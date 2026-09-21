import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Bug } from 'lucide-react';
import { logReactError, logger } from '@/utils/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  showErrorDetails?: boolean;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  context?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  private retryCount = 0;
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Enhanced error logging with context
    const context = this.props.context || 'ErrorBoundary';
    logger.error(`${context}: React Error Boundary triggered`, {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      retryCount: this.retryCount,
      timestamp: new Date().toISOString(),
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log the error details using the logging system
    logReactError(error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Here you could also log to an error reporting service
    // logErrorToService(error, errorInfo);
  }

  handleRetry = () => {
    this.retryCount++;
    logger.info('ErrorBoundary: Retry attempted', {
      retryCount: this.retryCount,
      maxRetries: this.maxRetries,
      context: this.props.context,
    });

    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleReload = () => {
    logger.info('ErrorBoundary: Page reload triggered', {
      context: this.props.context,
      retryCount: this.retryCount,
    });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const showErrorDetails = this.props.showErrorDetails ?? (process.env.NODE_ENV === 'development');
      const context = this.props.context || 'Unknown';

      return (
        <div className="max-w-md mx-auto px-4 sm:px-6">
          <Card className="border-red-200 bg-red-50">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <CardTitle className="text-red-800">Something went wrong</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-red-700">
                We encountered an unexpected error in {context}.
                This has been logged and our team will investigate.
              </p>

              {this.retryCount < this.maxRetries && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                  <p className="text-yellow-800 text-sm">
                    <Bug className="w-4 h-4 inline mr-1" />
                    Attempt {this.retryCount + 1} of {this.maxRetries + 1}
                  </p>
                </div>
              )}

              {showErrorDetails && this.state.error && (
                <details className="text-left bg-white p-3 rounded border text-sm">
                  <summary className="cursor-pointer font-medium text-red-800">
                    Error Details (Development Only)
                  </summary>
                  <pre className="mt-2 text-xs text-gray-700 whitespace-pre-wrap">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}

              <div className="flex gap-3 justify-center">
                {this.retryCount < this.maxRetries && (
                  <Button
                    onClick={this.handleRetry}
                    variant="outline"
                    className="border-red-300 text-red-700 hover:bg-red-100"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again ({this.maxRetries - this.retryCount} left)
                  </Button>
                )}
                <Button
                  onClick={this.handleReload}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Reload Page
                </Button>
              </div>

              <p className="text-sm text-red-600 mt-4">
                If this problem persists, please contact our support team.
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

// Loading component with proper error handling
export const LoadingSpinner = ({
  size = 'md',
  message = 'Loading...',
  context = 'component',
}: {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  context?: string;
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 space-y-2">
      <div
        className={`${sizeClasses[size]} border-2 border-blue-600 border-t-transparent rounded-full animate-spin`}
        role="status"
        aria-label={`Loading ${context}`}
      />
      <p className="text-sm text-gray-600">{message}</p>
    </div>
  );
};

// Safe component wrapper that handles loading and error states
export const SafeComponentWrapper = ({
  children,
  loading,
  error,
  onRetry,
  context = 'component',
}: {
  children: React.ReactNode;
  loading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  context?: string;
}) => {
  if (loading) {
    return <LoadingSpinner context={context} />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-4 space-y-4">
        <div className="text-red-600 text-center">
          <p className="font-medium">Error loading {context}</p>
          <p className="text-sm text-red-500 mt-1">{error.message}</p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  return <>{children}</>;
};

// Specialized Error Boundary for Authentication Components
export class AuthErrorBoundary extends Component<Omit<Props, 'context'>, State> {
  constructor(props: Omit<Props, 'context'>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('AuthErrorBoundary: Authentication error occurred', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    });

    // Clear auth state on critical auth errors
    if (error.message.includes('auth') || error.message.includes('token') || error.message.includes('session')) {
      logger.warn('AuthErrorBoundary: Clearing auth state due to critical auth error');
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.removeItem('supabase.auth.token');
    }

    logReactError(error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });
  }

  handleRetry = () => {
    logger.info('AuthErrorBoundary: Retry attempted for auth error');
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleReload = () => {
    logger.info('AuthErrorBoundary: Page reload triggered for auth error');
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-md mx-auto px-4 sm:px-6">
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
              <CardTitle className="text-orange-800">Authentication Error</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-orange-700">
                There was an issue with your authentication session.
                This might be due to an expired token or network connectivity issue.
              </p>

              <div className="flex gap-3 justify-center">
                <Button
                  onClick={this.handleRetry}
                  variant="outline"
                  className="border-orange-300 text-orange-700 hover:bg-orange-100"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button
                  onClick={this.handleReload}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  Reload Page
                </Button>
              </div>

              <p className="text-sm text-orange-600 mt-4">
                If this problem persists, please sign in again.
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
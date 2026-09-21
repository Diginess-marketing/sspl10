import React from 'react';
import { AlertCircle, RefreshCw, Home, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
  onClear?: () => void;
  onGoHome?: () => void;
  showHomeButton?: boolean;
  showClearButton?: boolean;
  showRetryButton?: boolean;
  className?: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  onRetry,
  onClear,
  onGoHome,
  showHomeButton = false,
  showClearButton = false,
  showRetryButton = false,
  className = '',
}) => {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      // Default retry behavior - refresh page
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      // Default home behavior - navigate to homepage
      window.location.href = '/';
    }
  };

  const isNetworkError = error.toLowerCase().includes('network') || 
                        error.toLowerCase().includes('connection') ||
                        error.toLowerCase().includes('timeout');

  const isNotFoundError = error.toLowerCase().includes('not found') ||
                         error.toLowerCase().includes('no players found') ||
                         error.toLowerCase().includes('no results');

  const getErrorIcon = () => {
    if (isNotFoundError) {
      return <Search className="w-8 h-8 text-amber-600" />;
    }
    return <AlertCircle className="w-8 h-8 text-red-600" />;
  };

  const getErrorTitle = () => {
    if (isNotFoundError) {
      return 'No Results Found';
    }
    if (isNetworkError) {
      return 'Connection Error';
    }
    return 'Error Occurred';
  };

  const getErrorMessage = () => {
    if (isNotFoundError) {
      return 'No players found matching your search criteria. Please check your search terms and try again.';
    }
    if (isNetworkError) {
      return 'Unable to connect to the server. Please check your internet connection and try again.';
    }
    return error;
  };

  const getSuggestionText = () => {
    if (isNotFoundError) {
      return 'Try searching with different keywords or check the spelling of mobile number, name, or email.';
    }
    if (isNetworkError) {
      return 'Please check your internet connection and try again. If the problem persists, contact support.';
    }
    return 'Please try again or contact support if the problem persists.';
  };

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <Card className="border-2 border-red-100">
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center space-y-6">
            {/* Error Icon */}
            <div className="p-4 bg-red-50 rounded-full">
              {getErrorIcon()}
            </div>

            {/* Error Content */}
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-gray-900">
                {getErrorTitle()}
              </h3>
              
              <div className="space-y-2">
                <p className="text-gray-700 leading-relaxed">
                  {getErrorMessage()}
                </p>
                
                <p className="text-sm text-gray-500">
                  {getSuggestionText()}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              {showRetryButton && (
                <Button
                  onClick={handleRetry}
                  variant="outline"
                  className="flex items-center gap-2 border-red-200 text-red-700 hover:bg-red-50"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </Button>
              )}

              {showClearButton && onClear && (
                <Button
                  onClick={onClear}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  New Search
                </Button>
              )}

              {showHomeButton && (
                <Button
                  onClick={handleGoHome}
                  variant="default"
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  <Home className="w-4 h-4" />
                  Go Home
                </Button>
              )}
            </div>

            {/* Error Code (for debugging) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="pt-4 border-t border-gray-100 w-full">
                <p className="text-xs text-gray-400 font-mono">
                  Error: {error}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Additional Help Text */}
      {isNotFoundError && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Search Tips:</h4>
          <ul className="text-sm text-blue-800 space-y-1 text-left">
            <li>• Enter complete 10-digit mobile number</li>
            <li>• Use exact name spelling</li>
            <li>• Verify email address format</li>
            <li>• Check for typos in your search terms</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ErrorState;
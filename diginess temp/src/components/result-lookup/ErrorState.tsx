import React from 'react';
import { AlertTriangle, RefreshCw, Home, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
  onClear?: () => void;
  showHomeButton?: boolean;
  className?: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  onRetry,
  onClear,
  showHomeButton = false,
  className = '',
}) => {
  const isNetworkError = error.toLowerCase().includes('network') ||
                        error.toLowerCase().includes('connection') ||
                        error.toLowerCase().includes('timeout');

  const isNotFoundError = error.toLowerCase().includes('not found') ||
                         error.toLowerCase().includes('no results');

  const getErrorIcon = () => {
    if (isNotFoundError) {
      return <Search className="w-12 h-12 text-orange-600" />;
    }
    return <AlertTriangle className="w-12 h-12 text-red-600" />;
  };

  const getErrorTitle = () => {
    if (isNotFoundError) {
      return 'No Results Found';
    }
    if (isNetworkError) {
      return 'Connection Error';
    }
    return 'Something Went Wrong';
  };

  const getErrorMessage = () => {
    if (isNotFoundError) {
      return 'We couldn\'t find any results matching your search criteria. Please check your input and try again.';
    }
    if (isNetworkError) {
      return 'Unable to connect to the server. Please check your internet connection and try again.';
    }
    return error || 'An unexpected error occurred while searching for results.';
  };

  const getSuggestions = () => {
    if (isNotFoundError) {
      return [
        'Double-check the player name, email, or ID',
        'Try searching with a different identifier type',
        'Ensure the spelling is correct',
        'Try removing the season filter to see all results',
      ];
    }
    if (isNetworkError) {
      return [
        'Check your internet connection',
        'Try again in a few moments',
        'Contact support if the problem persists',
      ];
    }
    return [
      'Try refreshing the page',
      'Clear your search and try again',
      'Contact support if the problem continues',
    ];
  };

  return (
    <Card className={`w-full max-w-md mx-auto ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-center gap-3 text-center">
          {getErrorIcon()}
          <span className="text-xl">{getErrorTitle()}</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Error Message */}
        <Alert variant={isNotFoundError ? 'default' : 'destructive'}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            {getErrorMessage()}
          </AlertDescription>
        </Alert>

        {/* Suggestions */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900 text-sm">
            What you can try:
          </h4>
          <ul className="space-y-2">
            {getSuggestions().map((suggestion, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 shrink-0" />
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          {onRetry && (
            <Button
              onClick={onRetry}
              className="w-full"
              variant="default"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          )}

          {onClear && (
            <Button
              onClick={onClear}
              variant="outline"
              className="w-full"
            >
              <Search className="w-4 h-4 mr-2" />
              New Search
            </Button>
          )}

          {showHomeButton && (
            <Button
              onClick={() => window.location.href = '/'}
              variant="ghost"
              className="w-full"
            >
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          )}
        </div>

        {/* Technical Details (only for non-user-friendly errors) */}
        {!isNotFoundError && !isNetworkError && error !== 'No results found' && (
          <details className="mt-4">
            <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
              Technical Details
            </summary>
            <pre className="mt-2 p-2 bg-gray-100 rounded text-xs text-gray-800 overflow-x-auto">
              {error}
            </pre>
          </details>
        )}
      </CardContent>
    </Card>
  );
};

export default ErrorState;
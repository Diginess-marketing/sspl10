import * as Sentry from '@sentry/react';

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;
const SENTRY_ENVIRONMENT = import.meta.env.VITE_SENTRY_ENVIRONMENT || 'development';

export const initSentry = async () => {
  const dsn = SENTRY_DSN;

  // If no DSN, do not initialize Sentry and avoid noisy runtime warnings.
  // In dev, emit a single concise info-level message for discoverability.
  if (!dsn) {
    if (import.meta.env.DEV) {
      // Logged only in development to avoid production noise
    }
    return;
  }

  // Initialize Sentry only once even if called multiple times
  if ((window as any).__SENTRY_INITIALIZED__) {
    return;
  }

  try {
    // Dynamically import browserTracingIntegration to avoid circular dependency issues
    const { browserTracingIntegration } = await import('@sentry/react');
    
    Sentry.init({
      dsn,
      environment: SENTRY_ENVIRONMENT,
      integrations: [browserTracingIntegration()],
      // Performance Monitoring
      tracesSampleRate: SENTRY_ENVIRONMENT === 'production' ? 0.1 : 1.0,
      // Session Replay
      replaysSessionSampleRate: SENTRY_ENVIRONMENT === 'production' ? 0.1 : 1.0,
      replaysOnErrorSampleRate: 1.0,
      // Release tracking
      release: import.meta.env.VITE_APP_VERSION || '1.0.0',
      // Error filtering
      beforeSend(event, hint) {
        // Filter out expected network errors
        if (event.exception) {
          const error = hint?.originalException;
          if (error && typeof error === 'object' && 'message' in error) {
            const message = (error as Error).message || '';
            if (
              message.includes('NetworkError') ||
              message.includes('Failed to fetch') ||
              message.includes('Load failed')
            ) {
              return null;
            }
          }
        }
        return event;
      },
    });

    (window as any).__SENTRY_INITIALIZED__ = true;

    if (import.meta.env.DEV) {
    }
  } catch (error) {
    if (import.meta.env.DEV) {
    }
  }
};

// User feedback helper
export const captureUserFeedback = (name: string, email: string, comments: string) => {
  Sentry.captureMessage(`User Feedback: ${name}`, {
    level: 'info',
    tags: {
      feedback: 'user',
    },
    user: {
      email,
      username: name,
    },
    extra: {
      comments,
    },
  });
};

// Custom error reporting
export const reportError = (error: Error, context?: Record<string, any>) => {
  Sentry.withScope((scope) => {
    if (context) {
      Object.keys(context).forEach(key => {
        scope.setTag(key, context[key]);
      });
    }
    Sentry.captureException(error);
  });
};


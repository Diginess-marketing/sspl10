import { supabase } from '@/integrations/supabase/client';
import { logger } from './logger';

export interface SessionConfig {
  maxSessionDuration: number; // in milliseconds
  refreshThreshold: number; // in milliseconds
  checkInterval: number; // in milliseconds
}

const DEFAULT_CONFIG: SessionConfig = {
  maxSessionDuration: 24 * 60 * 60 * 1000, // 24 hours
  refreshThreshold: 60 * 60 * 1000, // 1 hour before expiry
  checkInterval: 5 * 60 * 1000, // 5 minutes
};

class SessionManager {
  private config: SessionConfig;
  private checkInterval: NodeJS.Timeout | null = null;
  private lastActivity: number = Date.now();
  private isInitialized = false;

  constructor(config: Partial<SessionConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // Initialize session monitoring
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Check current session
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        logger.error('Session initialization error', { error: error.message });
        return;
      }

      if (session) {
        this.lastActivity = Date.now();
        logger.info('Session initialized', {
          userId: session.user.id,
          expiresAt: session.expires_at,
        });
      }

      // Set up session monitoring
      this.setupSessionMonitoring();
      this.isInitialized = true;

    } catch (error) {
      logger.error('Failed to initialize session manager', { error });
    }
  }

  // Set up automatic session monitoring
  private setupSessionMonitoring(): void {
    // Listen for auth state changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      logger.info('Auth state changed', { event, userId: session?.user?.id });

      switch (event) {
        case 'SIGNED_IN':
          this.lastActivity = Date.now();
          this.startPeriodicCheck();
          break;

        case 'SIGNED_OUT':
          this.stopPeriodicCheck();
          this.clearSessionData();
          break;

        case 'TOKEN_REFRESHED':
          logger.info('Token refreshed successfully');
          break;
      }
    });

    // Start periodic session health check
    this.startPeriodicCheck();
  }

  // Start periodic session validation
  private startPeriodicCheck(): void {
    if (this.checkInterval) return;

    this.checkInterval = setInterval(async () => {
      await this.validateSession();
    }, this.config.checkInterval);
  }

  // Stop periodic session validation
  private stopPeriodicCheck(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  // Validate current session and refresh if needed
  private async validateSession(): Promise<void> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        logger.error('Session validation error', { error: error.message });
        return;
      }

      if (!session) {
        logger.info('No active session found');
        return;
      }

      const now = Date.now();
      const expiresAt = session.expires_at ? session.expires_at * 1000 : 0;
      const timeUntilExpiry = expiresAt - now;

      // Check if session is close to expiry
      if (timeUntilExpiry < this.config.refreshThreshold) {
        logger.info('Session close to expiry, attempting refresh', {
          timeUntilExpiry: Math.round(timeUntilExpiry / 1000),
        });

        await this.refreshSession();
      }

      // Check for session timeout based on activity
      const timeSinceActivity = now - this.lastActivity;
      if (timeSinceActivity > this.config.maxSessionDuration) {
        logger.info('Session timeout due to inactivity');
        await this.signOut();
      }

    } catch (error) {
      logger.error('Session validation failed', { error });
    }
  }

  // Refresh the current session
  private async refreshSession(): Promise<void> {
    try {
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        logger.error('Session refresh failed', { error: error.message });
        // If refresh fails, sign out
        await this.signOut();
        return;
      }

      if (data.session) {
        logger.info('Session refreshed successfully', {
          expiresAt: data.session.expires_at,
        });
      }

    } catch (error) {
      logger.error('Session refresh error', { error });
    }
  }

  // Sign out user
  private async signOut(): Promise<void> {
    try {
      await supabase.auth.signOut();
      this.clearSessionData();
      logger.info('User signed out due to session expiry');
    } catch (error) {
      logger.error('Sign out error', { error });
    }
  }

  // Clear session-related data
  private clearSessionData(): void {
    // Clear any session-specific data from localStorage
    const keysToRemove = Object.keys(localStorage).filter(key =>
      key.startsWith('supabase.auth.') ||
      key.includes('session'),
    );

    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  // Update last activity timestamp
  updateActivity(): void {
    this.lastActivity = Date.now();
  }

  // Get current session info
  async getSessionInfo() {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      logger.error('Failed to get session info', { error: error.message });
      return null;
    }

    if (!session) return null;

    const now = Date.now();
    const expiresAt = session.expires_at ? session.expires_at * 1000 : 0;

    return {
      userId: session.user.id,
      email: session.user.email,
      expiresAt,
      timeUntilExpiry: expiresAt - now,
      isExpiringSoon: (expiresAt - now) < this.config.refreshThreshold,
      lastActivity: this.lastActivity,
      timeSinceActivity: now - this.lastActivity,
    };
  }

  // Force session refresh
  async forceRefresh(): Promise<void> {
    await this.refreshSession();
  }

  // Cleanup
  destroy(): void {
    this.stopPeriodicCheck();
    this.clearSessionData();
    this.isInitialized = false;
  }
}

// Create singleton instance
export const sessionManager = new SessionManager();

// Activity tracking helper
export const trackUserActivity = () => {
  sessionManager.updateActivity();
};

// Auto-track common user activities
if (typeof window !== 'undefined') {
  ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
    window.addEventListener(event, trackUserActivity, { passive: true });
  });
}
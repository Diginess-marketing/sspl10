import { supabase } from '@/integrations/supabase/client';

export interface SecurityEvent {
  type: 'qr_access' | 'admin_action' | 'suspicious_activity';
  userId?: string;
  ipAddress: string;
  userAgent: string;
  details: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export class SecurityService {
  /**
   * Validate QR code access permissions
   */
  static async validateQRAccess(qrCodeId: string, userId?: string): Promise<{
    allowed: boolean;
    reason?: string;
    riskLevel: 'low' | 'medium' | 'high';
  }> {
    try {
      // For now, allow access (will be properly implemented after DB migration)
      // In production, this would validate against the database
      return {
        allowed: true,
        riskLevel: 'low',
      };
    } catch (error) {
      return {
        allowed: false,
        reason: 'Validation error',
        riskLevel: 'high',
      };
    }
  }

  /**
   * Check if user has admin privileges
   */
  static async checkAdminStatus(userId: string): Promise<boolean> {
    try {
      // In a real implementation, this would check user roles
      // For now, return false (no admin access)
      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Rate limiting for QR code operations
   */
  private static rateLimitCache = new Map<string, { count: number; resetTime: number }>();

  static checkRateLimit(identifier: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
    const now = Date.now();
    const key = identifier;
    const limit = this.rateLimitCache.get(key);

    if (!limit || now > limit.resetTime) {
      // Reset or create new limit
      this.rateLimitCache.set(key, {
        count: 1,
        resetTime: now + windowMs,
      });
      return true;
    }

    if (limit.count >= maxRequests) {
      return false; // Rate limit exceeded
    }

    limit.count++;
    return true;
  }

  /**
   * Detect suspicious activity
   */
  static detectSuspiciousActivity(
    ipAddress: string,
    userAgent: string,
    requestCount: number,
    timeWindow: number = 3600000, // 1 hour
  ): boolean {
    // Check for rapid requests from same IP
    if (requestCount > 50) {
      return true;
    }

    // Check for suspicious user agents
    const suspiciousPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
    ];

    if (suspiciousPatterns.some(pattern => pattern.test(userAgent))) {
      return true;
    }

    // Check for rate limiting violations
    if (!this.checkRateLimit(ipAddress, 20, timeWindow)) {
      return true;
    }

    return false;
  }

  /**
   * Log security events
   */
  static async logSecurityEvent(event: SecurityEvent): Promise<void> {
    try {
      // In production, this would log to a security monitoring system
      // For now, we'll use local storage for demo purposes
      const events = JSON.parse(localStorage.getItem('security_events') || '[]');
      events.push({
        ...event,
        timestamp: new Date().toISOString(),
      });

      // Keep only last 100 events
      if (events.length > 100) {
        events.splice(0, events.length - 100);
      }

      localStorage.setItem('security_events', JSON.stringify(events));

    } catch (error) {
    }
  }

  /**
   * Sanitize input data
   */
  static sanitizeInput(input: string): string {
    if (typeof input !== 'string') return '';

    // Remove potentially dangerous characters
    return input
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/data:/gi, '') // Remove data: protocol
      .trim()
      .substring(0, 1000); // Limit length
  }

  /**
   * Validate URL for QR code targets
   */
  static validateTargetUrl(url: string): { isValid: boolean; reason?: string } {
    try {
      const urlObj = new URL(url);

      // Only allow HTTP and HTTPS
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return { isValid: false, reason: 'Only HTTP and HTTPS URLs are allowed' };
      }

      // Check for suspicious domains
      const suspiciousDomains = [
        'localhost',
        '127.0.0.1',
        '0.0.0.0',
        '10.0.0.0/8',
        '172.16.0.0/12',
        '192.168.0.0/16',
      ];

      if (suspiciousDomains.some(domain => urlObj.hostname.includes(domain))) {
        return { isValid: false, reason: 'Suspicious domain detected' };
      }

      return { isValid: true };
    } catch {
      return { isValid: false, reason: 'Invalid URL format' };
    }
  }

  /**
   * Generate secure QR code identifier
   */
  static generateSecureId(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Encrypt sensitive data
   */
  static async encryptData(data: string, key?: string): Promise<string> {
    try {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);

      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        encoder.encode(key || 'default-sspl-key'),
        'AES-GCM',
        false,
        ['encrypt'],
      );

      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        cryptoKey,
        dataBuffer,
      );

      // Combine IV and encrypted data
      const combined = new Uint8Array(iv.length + encrypted.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encrypted), iv.length);

      return btoa(String.fromCharCode(...combined));
    } catch (error) {
      throw error;
    }
  }

  /**
   * Decrypt sensitive data
   */
  static async decryptData(encryptedData: string, key?: string): Promise<string> {
    try {
      const encrypted = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));

      const iv = encrypted.slice(0, 12);
      const data = encrypted.slice(12);

      const encoder = new TextEncoder();
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        encoder.encode(key || 'default-sspl-key'),
        'AES-GCM',
        false,
        ['decrypt'],
      );

      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        cryptoKey,
        data,
      );

      const decoder = new TextDecoder();
      return decoder.decode(decrypted);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get security statistics
   */
  static getSecurityStats(): {
    totalEvents: number;
    eventsByType: Record<string, number>;
    eventsBySeverity: Record<string, number>;
    recentEvents: SecurityEvent[];
  } {
    try {
      const events = JSON.parse(localStorage.getItem('security_events') || '[]');

      const stats = {
        totalEvents: events.length,
        eventsByType: {} as Record<string, number>,
        eventsBySeverity: {} as Record<string, number>,
        recentEvents: events.slice(-10) as SecurityEvent[],
      };

      events.forEach((event: SecurityEvent) => {
        stats.eventsByType[event.type] = (stats.eventsByType[event.type] || 0) + 1;
        stats.eventsBySeverity[event.severity] = (stats.eventsBySeverity[event.severity] || 0) + 1;
      });

      return stats;
    } catch (error) {
      return {
        totalEvents: 0,
        eventsByType: {},
        eventsBySeverity: {},
        recentEvents: [],
      };
    }
  }

  /**
   * Clear old security events
   */
  static clearOldEvents(daysOld: number = 30): void {
    try {
      const events = JSON.parse(localStorage.getItem('security_events') || '[]');
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const filteredEvents = events.filter((event: any) =>
        new Date(event.timestamp) > cutoffDate,
      );

      localStorage.setItem('security_events', JSON.stringify(filteredEvents));
    } catch (error) {
    }
  }
}
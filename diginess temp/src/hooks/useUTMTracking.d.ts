/**
 * Type declarations for useUTMTracking hook
 */

export interface UTMData {
  utm_id?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

export interface PaymentData {
  registration_id: string;
  user_name?: string;
  email?: string;
  phone?: string;
  amount?: number;
}

export interface UTMEventData {
  registration_id?: string;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface UseUTMTrackingReturn {
  /**
   * Log a generic UTM event
   */
  logEvent: (eventType: string, eventData?: UTMEventData) => Promise<unknown | null>;
  
  /**
   * Log a registration event
   */
  logRegistration: (registration_id: string, additionalData?: Record<string, unknown>) => Promise<unknown | null>;
  
  /**
   * Log a payment event and record paid user in utm_payment_users table
   */
  logPayment: (paymentData: PaymentData) => Promise<unknown | null>;
  
  /**
   * Get stored UTM data from localStorage
   */
  getUTMData: () => UTMData | null;
  
  /**
   * Whether UTM tracking is enabled (utm_id exists)
   */
  isTrackingEnabled: boolean;
}

/**
 * Custom hook for UTM parameter tracking
 * - Extracts and stores UTM parameters from URL on mount
 * - Logs "scan" event if utm_id exists
 * - Provides functions to log "registration" and "payment" events
 */
export function useUTMTracking(): UseUTMTrackingReturn;

export default useUTMTracking;

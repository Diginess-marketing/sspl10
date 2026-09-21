import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { extractUTMParams, storeUTMData, getUTMData, isUTMTrackingEnabled, generateEventId } from '../utils/utm';
import { googleAnalyticsService } from '../services/googleAnalyticsService';

/**
 * Custom hook for UTM parameter tracking
 * - Extracts and stores UTM parameters from URL on mount
 * - Logs "scan" event if utm_id exists
 * - Provides function to log "registration" events
 * - Sends events to both Supabase and Google Analytics
 */
export const useUTMTracking = () => {
  const logEvent = useCallback(async (eventType, eventData = {}) => {
    try {
      const utmData = getUTMData();

      if (!utmData || !utmData.utm_id) {
        console.log('UTM tracking not enabled (no utm_id found)');
        return null;
      }

      const eventRecord = {
        event_type: eventType,
        utm_id: utmData.utm_id,
        utm_source: utmData.utm_source,
        utm_medium: utmData.utm_medium,
        utm_campaign: utmData.utm_campaign,
        event_id: generateEventId(),
        timestamp: new Date().toISOString(),
        ...eventData,
      };

      // Log to Supabase
      const { data, error } = await supabase.from('utm_events').insert([eventRecord]);

      if (error) {
        console.error(`Error logging ${eventType} event to Supabase:`, error);
      } else {
        console.log(`${eventType} event logged to Supabase successfully:`, data);
      }

      // Log to Google Analytics (non-blocking)
      try {
        const gaData = {
          utm_id: utmData.utm_id,
          utm_source: utmData.utm_source,
          utm_medium: utmData.utm_medium,
          utm_campaign: utmData.utm_campaign,
          qr_code: utmData.utm_source === 'qr' || utmData.utm_medium === 'scan',
          ...eventData,
        };

        if (eventType === 'scan') {
          await googleAnalyticsService.trackQRScan(gaData);
        } else {
          await googleAnalyticsService.trackUTMEvent(eventType, gaData);
        }
        console.log(`${eventType} event logged to Google Analytics successfully`);
      } catch (gaError) {
        // Non-critical error - GA tracking failure shouldn't break the flow
        console.warn(`Failed to log ${eventType} to Google Analytics:`, gaError);
      }

      return data;
    } catch (error) {
      console.error('Error in logEvent:', error);
      return null;
    }
  }, []);

  /**
   * Log a registration event
   * @param {string} registration_id - The registration ID from the API response
   * @param {Object} additionalData - Optional additional data to store
   */
  const logRegistration = useCallback(
    async (registration_id, additionalData = {}) => {
      const result = await logEvent('registration', {
        registration_id,
        ...additionalData,
      });

      // Send to Google Analytics with registration-specific tracking
      try {
        const utmData = getUTMData();
        if (utmData && utmData.utm_id) {
          await googleAnalyticsService.trackRegistration({
            registration_id,
            utm_id: utmData.utm_id,
            utm_source: utmData.utm_source,
            utm_medium: utmData.utm_medium,
            utm_campaign: utmData.utm_campaign,
            qr_code: utmData.utm_source === 'qr' || utmData.utm_medium === 'scan',
            ...additionalData,
          });
        }
      } catch (gaError) {
        console.warn('Failed to track registration in Google Analytics:', gaError);
      }

      return result;
    },
    [logEvent]
  );

  /**
   * Log a visitor lead (contact info) to Supabase
   * @param {Object} leadData - { name, email, phone, ... }
   */
  const logVisitorLead = useCallback(async (leadData) => {
    try {
      // Basic Device Info Parsing
      const ua = window.navigator?.userAgent || '';
      let deviceType = 'Desktop';
      if (/mobile/i.test(ua)) deviceType = 'Mobile';
      if (/tablet/i.test(ua)) deviceType = 'Tablet';
      
      let os = 'Unknown OS';
      if (/windows/i.test(ua)) os = 'Windows';
      else if (/mac/i.test(ua)) os = 'macOS';
      else if (/linux/i.test(ua)) os = 'Linux';
      else if (/android/i.test(ua)) os = 'Android';
      else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';

      const isAnonymous = !leadData.phone && !leadData.email;
      const defaultName = isAnonymous ? `Anonymous (${deviceType} / ${os})` : (leadData.name || null);

      const record = {
        name: defaultName,
        email: leadData.email || null,
        phone: leadData.phone || null,
        utm_source: leadData.utm_source,
        utm_medium: leadData.utm_medium,
        utm_campaign: leadData.utm_campaign,
        utm_id: leadData.utm_id,
        page_url: window.location.href,
      };

      // Check for existing session-based capture to avoid spamming DB on reload
      const sessionKey = isAnonymous 
        ? `anonymous_lead_captured_${leadData.utm_campaign || 'direct'}` 
        : `lead_captured_${leadData.phone || leadData.email}`;
        
      if (sessionStorage.getItem(sessionKey)) {
        console.log('Visitor lead already captured in this session');
        return;
      }

      // Upsert into Supabase
      // Note: We use 'insert' here. If you have unique constraints, use 'upsert'.
      // For now, simple insert to log every visit source for that contact is fine, 
      // or you can dedupe by phone/email if you prefer one record per user.
      const { data, error } = await supabase.from('visitor_leads').insert([record]);

      if (error) {
        // Graceful failure - likely table doesn't exist yet or RLS issue
        console.warn('Error logging visitor lead (check table exists):', error);
      } else {
        console.log('✅ Visitor lead captured:', data);
        sessionStorage.setItem(sessionKey, 'true');
      }

    } catch (err) {
      console.error('Error in logVisitorLead:', err);
    }
  }, []);

  /**
   * Log a payment event and record paid user in utm_payment_users table
   * @param {Object} paymentData - Payment details
   * @param {string} paymentData.registration_id - The registration ID (UUID)
   * @param {string} paymentData.user_name - User's full name
   * @param {string} paymentData.email - User's email
   * @param {string} paymentData.phone - User's phone number
   * @param {number} paymentData.amount - Payment amount
   * @returns {Promise<Object|null>} The result from Supabase RPC or null if not tracking
   */
  const logPayment = useCallback(
    async (paymentData) => {
      try {
        const utmData = getUTMData();

        // Only track if UTM tracking is enabled
        if (!utmData || !utmData.utm_id) {
          console.log('UTM payment tracking skipped (no utm_id found)');
          return null;
        }

        const { registration_id, user_name, email, phone, amount } = paymentData;

        // Call the add_utm_paid_user Supabase function
        const { data, error } = await supabase.rpc('add_utm_paid_user', {
          p_registration_id: registration_id,
          p_user_name: user_name || null,
          p_email: email || null,
          p_phone: phone || null,
          p_amount: amount || 0,
        });

        if (error) {
          console.error('Error logging UTM payment to Supabase:', error);
        } else {
          console.log('✅ UTM payment logged to Supabase successfully:', data);
        }

        // Track payment conversion in Google Analytics
        try {
          await googleAnalyticsService.trackPaymentConversion({
            registration_id,
            payment_amount: amount || 0,
            utm_id: utmData.utm_id,
            utm_source: utmData.utm_source,
            utm_medium: utmData.utm_medium,
            utm_campaign: utmData.utm_campaign,
            qr_code: utmData.utm_source === 'qr' || utmData.utm_medium === 'scan',
            currency: 'INR',
            user_name,
            email,
          });
          console.log('✅ Payment conversion tracked in Google Analytics');
        } catch (gaError) {
          console.warn('Failed to track payment in Google Analytics:', gaError);
        }

        return data;
      } catch (error) {
        console.error('Error in logPayment:', error);
        return null;
      }
    },
    []
  );

  /**
   * Initialize UTM tracking on component mount
   */
  useEffect(() => {
    try {
      // Extract UTM parameters from URL
      const utmParams = extractUTMParams();

      // Store in localStorage & Cookies
      storeUTMData(utmParams);

      // Always log visitor lead (either anonymous or contact info)
      if (utmParams.utm_source || utmParams.utm_campaign || utmParams.utm_id) {
         logVisitorLead(utmParams);
      } else {
        // Fallback: Check if we have stored contact info from previous page/session
        // and current page has UTMs but no contact info (e.g. user navigated)
        const stored = getUTMData();
        if (stored && (stored.phone || stored.email || stored.utm_source)) {
          // Optional: Re-log or skip? 
          // Let's only log if we are on a "fresh" campaign hit (utm_id present in URL)
          if (utmParams.utm_id) {
            const mergedData = { ...stored, ...utmParams };
            logVisitorLead(mergedData);
          }
        }
      }

      // Log scan event if utm_id exists
      if (isUTMTrackingEnabled()) {
        logEvent('scan', {
          metadata: {
            page: window.location.pathname,
            referrer: document.referrer,
          }
        });
      }
    } catch (error) {
      console.error('Error initializing UTM tracking:', error);
    }
  }, [logEvent, logVisitorLead]);

  return {
    logEvent,
    logRegistration,
    logPayment,
    getUTMData,
    isTrackingEnabled: isUTMTrackingEnabled(),
  };
};

export default useUTMTracking;

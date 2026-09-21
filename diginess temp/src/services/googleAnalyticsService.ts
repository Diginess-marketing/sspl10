import { supabase } from '@/integrations/supabase/client';

export interface GAEventData {
  name: string;
  parameters?: Record<string, any>;
}

export interface GAPageViewData {
  page_title?: string;
  page_location?: string;
  page_path?: string;
}

export interface GAConfig {
  measurement_id: string;
  enabled: boolean;
  debug_mode: boolean;
  tracking_enabled: boolean;
  exclude_admin_users: boolean;
  sample_rate: number;
  custom_dimensions?: Record<string, any>;
  custom_metrics?: Record<string, any>;
  event_tracking?: Record<string, any>;
  privacy_settings?: Record<string, any>;
}

class GoogleAnalyticsService {
  private config: GAConfig | null = null;
  private initialized = false;
  private retryAttempts = 0;
  private maxRetries = 3;

  /**
   * Initialize Google Analytics service
   */
  async initialize(): Promise<boolean> {
    try {
      if (this.initialized) return true;

      // Load configuration from admin_settings table
      const { data: config, error } = await supabase
        .from('admin_settings')
        .select('*')
        .eq('config_key', 'google_analytics_config')
        .single();

      if (error && error.code !== 'PGRST116') {
        return false;
      }

      if (!config) {
        return false;
      }

      // Parse the configuration from the content field
      const gaConfig = (config as any).content as GAConfig;
      if (!gaConfig || !gaConfig.enabled) {
        return false;
      }

      this.config = gaConfig;
      this.initialized = true;
      this.retryAttempts = 0;

      // Initialize gtag if not already present
      this.initializeGtag();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Initialize Google Tag Manager (gtag)
   */
  private initializeGtag(): void {
    if (!this.config?.measurement_id) return;

    // Check if gtag is already loaded
    if ((window as any).gtag) {
      return;
    }

    // Load Google Analytics script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.config.measurement_id}`;
    document.head.appendChild(script);

    // Initialize gtag
    (window as any).dataLayer = (window as any).dataLayer || [];
    function gtag(...args: any[]) {
      (window as any).dataLayer.push(args);
    }
    (window as any).gtag = gtag;

    gtag('js', new Date());
    gtag('config', this.config.measurement_id, {
      debug_mode: this.config.debug_mode,
      custom_map: this.config.custom_dimensions,
      send_page_view: this.config.tracking_enabled,
    });
  }

  /**
   * Track page view
   */
  async trackPageView(pageData: GAPageViewData = {}): Promise<void> {
    if (!this.initialized || !this.config?.tracking_enabled) {
      return;
    }

    try {
      const eventData = {
        page_title: pageData.page_title || document.title,
        page_location: pageData.page_location || window.location.href,
        page_path: pageData.page_path || window.location.pathname,
        ...pageData,
      };

      // Send to Google Analytics
      if ((window as any).gtag) {
        (window as any).gtag('event', 'page_view', eventData);
      }

      // Store in local database for analytics
      await this.storeEvent('page_view', eventData);
    } catch (error) {
      await this.handleRetry();
    }
  }

  /**
   * Track custom event
   */
  async trackEvent(eventName: string, parameters: Record<string, any> = {}): Promise<void> {
    if (!this.initialized || !this.config?.tracking_enabled) {
      return;
    }

    try {
      const eventData = {
        event_category: parameters.category || 'engagement',
        event_label: parameters.label,
        value: parameters.value,
        custom_parameters: parameters.custom_parameters,
        ...parameters,
      };

      // Send to Google Analytics
      if ((window as any).gtag) {
        (window as any).gtag('event', eventName, eventData);
      }

      // Store in local database for analytics
      await this.storeEvent(eventName, eventData);
    } catch (error) {
      await this.handleRetry();
    }
  }

  /**
   * Track UTM-specific events with custom dimensions
   */
  async trackUTMEvent(eventType: 'scan' | 'registration' | 'payment', utmData: {
    utm_id?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    registration_id?: string;
    payment_amount?: number;
    qr_code?: boolean;
    [key: string]: any;
  }): Promise<void> {
    if (!this.initialized || !this.config?.tracking_enabled) {
      return;
    }

    try {
      const eventName = `utm_${eventType}`;
      const eventData: Record<string, any> = {
        event_category: 'utm_tracking',
        event_action: eventType,
      };

      // Map UTM parameters to custom dimensions
      if (utmData.utm_id) eventData.utm_id = utmData.utm_id;
      if (utmData.utm_source) eventData.utm_source = utmData.utm_source;
      if (utmData.utm_medium) eventData.utm_medium = utmData.utm_medium;
      if (utmData.utm_campaign) eventData.utm_campaign = utmData.utm_campaign;
      if (utmData.registration_id) eventData.registration_id = utmData.registration_id;
      if (utmData.qr_code !== undefined) eventData.qr_code = utmData.qr_code ? 'yes' : 'no';
      
      // Add conversion value for payment events
      if (eventType === 'payment' && utmData.payment_amount) {
        eventData.value = utmData.payment_amount;
        eventData.payment_amount = utmData.payment_amount;
        eventData.currency = utmData.currency || 'INR';
      }

      // Add registration count for registration events
      if (eventType === 'registration') {
        eventData.registration_count = 1;
      }

      // Send to Google Analytics
      if ((window as any).gtag) {
        (window as any).gtag('event', eventName, eventData);
      }

      // Store in local database
      await this.storeEvent(eventName, eventData);
    } catch (error) {
      await this.handleRetry();
    }
  }

  /**
   * Track QR code scan events
   */
  async trackQRScan(qrData: {
    utm_id: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    page_path?: string;
    [key: string]: any;
  }): Promise<void> {
    return this.trackUTMEvent('scan', {
      ...qrData,
      qr_code: true,
    });
  }

  /**
   * Track registration events with UTM attribution
   */
  async trackRegistration(registrationData: {
    registration_id: string;
    utm_id?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    qr_code?: boolean;
    [key: string]: any;
  }): Promise<void> {
    return this.trackUTMEvent('registration', registrationData);
  }

  /**
   * Track payment conversion events with UTM attribution
   */
  async trackPaymentConversion(paymentData: {
    registration_id: string;
    payment_amount: number;
    utm_id?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    qr_code?: boolean;
    currency?: string;
    [key: string]: any;
  }): Promise<void> {
    return this.trackUTMEvent('payment', paymentData);
  }

  /**
   * Track user engagement (time spent, scroll depth, etc.)
   */
  async trackUserEngagement(): Promise<void> {
    if (!this.initialized || !this.config?.tracking_enabled) {
      return;
    }

    try {
      const engagementData = {
        session_duration: this.getSessionDuration(),
        scroll_depth: this.getScrollDepth(),
        page_views_count: this.getPageViewsCount(),
        timestamp: new Date().toISOString(),
      };

      await this.trackEvent('user_engagement', engagementData);
    } catch (error) {
    }
  }

  /**
   * Track conversion events
   */
  async trackConversion(conversionType: string, parameters: Record<string, any> = {}): Promise<void> {
    if (!this.initialized || !this.config?.tracking_enabled) {
      return;
    }

    try {
      const conversionData = {
        conversion_type: conversionType,
        value: parameters.value,
        currency: parameters.currency || 'INR',
        transaction_id: parameters.transaction_id,
        ...parameters,
      };

      await this.trackEvent('conversion', conversionData);
    } catch (error) {
    }
  }

  /**
   * Store event in local database for analytics
   */
  private async storeEvent(eventName: string, parameters: Record<string, any>): Promise<void> {
    try {
      // Generate unique section_name for each event to avoid constraint violations
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substr(2, 9);
      const uniqueSectionName = `analytics_event_${timestamp}_${randomId}`;

      // Add timeout to prevent hanging requests
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 5000),
      );

      // Store in website_content table as analytics data
      const insertPromise = supabase
        .from('website_content')
        .insert({
          section_name: uniqueSectionName,
          content: {
            event_name: eventName,
            event_category: parameters.event_category || 'engagement',
            event_action: eventName,
            event_label: parameters.event_label || '',
            event_value: parameters.value || 0,
            custom_parameters: parameters,
            session_id: this.getSessionId(),
            user_id: (await supabase.auth.getUser()).data.user?.id || null,
            timestamp: new Date().toISOString(),
            page_url: window.location.href,
            user_agent: navigator.userAgent,
            ip_address: 'client_side', // Will be populated server-side
          },
        });

      const { error } = await Promise.race([
        insertPromise,
        timeoutPromise,
      ]) as { error: any };

      if (error) {
        // Silent fail for analytics - don't disrupt user experience
        if (import.meta.env.DEV) {
        }
      }
    } catch (error) {
      // Silent fail for analytics - don't disrupt user experience
      if (import.meta.env.DEV) {
      }
    }
  }

  /**
   * Get session duration
   */
  private getSessionDuration(): number {
    const sessionStart = sessionStorage.getItem('ga_session_start');
    if (!sessionStart) {
      sessionStorage.setItem('ga_session_start', Date.now().toString());
      return 0;
    }
    return Date.now() - parseInt(sessionStart);
  }

  /**
   * Get scroll depth
   * Note: This method reads layout properties and should be called sparingly
   * Consider debouncing or using IntersectionObserver for scroll tracking
   */
  private getScrollDepth(): number {
    // Use pageYOffset which is less likely to trigger layout
    const scrollTop = window.pageYOffset || 0;
    const windowHeight = window.innerHeight || 0;
    
    // Cache document height calculation to avoid repeated reflows
    if (!this.cachedDocHeight || Date.now() - this.lastDocHeightCheck > 5000) {
      this.cachedDocHeight = Math.max(
        document.body.scrollHeight || 0,
        document.body.offsetHeight || 0,
        document.documentElement.clientHeight || 0,
        document.documentElement.scrollHeight || 0,
        document.documentElement.offsetHeight || 0,
      );
      this.lastDocHeightCheck = Date.now();
    }
    
    return Math.round(((scrollTop + windowHeight) / this.cachedDocHeight) * 100);
  }

  private cachedDocHeight: number = 0;
  private lastDocHeightCheck: number = 0;

  /**
   * Get page views count for session
   */
  private getPageViewsCount(): number {
    const count = sessionStorage.getItem('ga_page_views');
    return parseInt(count || '0');
  }

  /**
   * Get or create session ID
   */
  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('ga_session_id');
    if (!sessionId) {
      sessionId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('ga_session_id', sessionId);
    }
    return sessionId;
  }

  /**
   * Handle retry logic for failed calls
   */
  private async handleRetry(): Promise<void> {
    if (this.retryAttempts < this.maxRetries) {
      this.retryAttempts++;
      // Exponential backoff
      const delay = Math.pow(2, this.retryAttempts) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));

      // Re-initialize if needed
      if (!this.initialized) {
        await this.initialize();
      }
    } else {
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): GAConfig | null {
    return this.config;
  }

  /**
   * Check if service is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Update configuration
   */
  async updateConfig(newConfig: Partial<GAConfig>): Promise<boolean> {
    try {
      if (!this.config) return false;

      const updatedConfig = { ...this.config, ...newConfig };

      // Update configuration in admin_settings table
      const { error } = await supabase
        .from('admin_settings')
        .update({
          content: updatedConfig,
          updated_at: new Date().toISOString(),
        })
        .eq('config_key', 'google_analytics_config');

      if (error) throw error;

      this.config = updatedConfig;
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Create singleton instance
export const googleAnalyticsService = new GoogleAnalyticsService();

// Auto-initialize on page load
if (typeof window !== 'undefined') {
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      googleAnalyticsService.initialize();
    });
  } else {
    googleAnalyticsService.initialize();
  }

  // Track page visibility changes for engagement tracking
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      googleAnalyticsService.trackUserEngagement();
    }
  });

  // Track scroll events for engagement with RAF throttling
  let scrollTimeout: NodeJS.Timeout;
  let rafId: number | null = null;
  
  window.addEventListener('scroll', () => {
    // Cancel any pending RAF
    if (rafId) {
      cancelAnimationFrame(rafId);
    }
    
    // Use RAF to avoid forced reflows during scroll
    rafId = requestAnimationFrame(() => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        googleAnalyticsService.trackUserEngagement();
      }, 1000);
      rafId = null;
    });
  }, { passive: true });
}

export default googleAnalyticsService;
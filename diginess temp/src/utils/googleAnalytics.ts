/**
 * Google Analytics service for SSPL T10
 * Handles event tracking for user interactions, registration, and payment events
 */

interface GAEventData {
  event_category: string;
  event_label?: string;
  value?: number;
  custom_parameters?: { [key: string]: any };
}

interface GAPlayerData {
  player_id?: string;
  player_name?: string;
  player_email?: string;
  player_position?: string;
  player_state?: string;
  player_city?: string;
  registration_type?: 'individual' | 'team' | 'students';
}

interface GAPaymentData {
  payment_id?: string;
  order_id?: string;
  amount?: number;
  currency?: string;
  payment_method?: string;
  payment_status?: string;
}

class GoogleAnalyticsService {
  private measurementId: string;
  private isEnabled: boolean;
  private debugMode: boolean;

  constructor() {
    // Get GA config from environment or use default
    this.measurementId = (import.meta.env?.VITE_GA_MEASUREMENT_ID as string) || 'G-R31DRZTRVF';
    this.isEnabled = (import.meta.env?.VITE_GA_ENABLED as string) !== 'false';
    this.debugMode = (import.meta.env?.VITE_GA_DEBUG as string) === 'true';

    if (this.isEnabled) {
      this.initializeGA();
    }
  }

  private initializeGA() {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    // Avoid duplicate script insertion and repeated layout work
    // Avoid layout thrash: ensure GA bootstrap runs once and uses stable DOM references.
    if ((window as any).__SSPL_GA_INITIALIZED__) {
      return;
    }

    // Check if gtag is already available from host page
    if (typeof window.gtag === 'function') {
      (window as any).__SSPL_GA_INITIALIZED__ = true;
      return;
    }

    // Defer GA loading until after page load to prevent blocking
    const bootstrap = () => {
      if ((window as any).__SSPL_GA_INITIALIZED__ || typeof window.gtag === 'function') {
        (window as any).__SSPL_GA_INITIALIZED__ = true;
        return;
      }

      const script1 = document.createElement('script');
      script1.async = true;
      script1.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`;
      document.head.appendChild(script1);

      const script2 = document.createElement('script');
      script2.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${this.measurementId}', {
          anonymize_ip: true,
          respect_do_not_track: true,
          cookie_expires: 63072000
        });
      `;
      document.head.appendChild(script2);

      window.gtag = function () {
        window.dataLayer.push(arguments);
      };

      (window as any).__SSPL_GA_INITIALIZED__ = true;
    };

    // Wait for page load before initializing GA
    if (document.readyState === 'complete') {
      // Page already loaded, use requestIdleCallback
      const idle = (window as any).requestIdleCallback;
      if (typeof idle === 'function') {
        idle(bootstrap, { timeout: 2000 });
      } else {
        setTimeout(bootstrap, 0);
      }
    } else {
      // Wait for page load event
      window.addEventListener('load', () => {
        const idle = (window as any).requestIdleCallback;
        if (typeof idle === 'function') {
          idle(bootstrap, { timeout: 2000 });
        } else {
          setTimeout(bootstrap, 0);
        }
      }, { once: true });
    }
  }

  private logEvent(eventName: string, parameters: any) {
    if (this.debugMode) {
    }

    if (this.isEnabled && window.gtag) {
      window.gtag('event', eventName, parameters);
    }
  }

  // Page view tracking
  trackPageView(pagePath: string, pageTitle?: string) {
    this.logEvent('page_view', {
      page_path: pagePath,
      page_title: pageTitle || document.title,
    });
  }

  // Registration events
  trackRegistrationStart(playerData?: GAPlayerData) {
    this.logEvent('registration_start', {
      event_category: 'registration',
      event_label: 'form_started',
      custom_parameters: {
        ...playerData,
      },
    });
  }

  trackRegistrationStep(step: number, stepName: string, playerData?: GAPlayerData) {
    this.logEvent('registration_step', {
      event_category: 'registration',
      event_label: stepName,
      value: step,
      custom_parameters: {
        step_number: step,
        ...playerData,
      },
    });
  }

  trackRegistrationComplete(playerData: GAPlayerData) {
    this.logEvent('registration_complete', {
      event_category: 'registration',
      event_label: 'successful_registration',
      custom_parameters: {
        player_id: playerData.player_id,
        player_position: playerData.player_position,
        player_state: playerData.player_state,
        player_city: playerData.player_city,
      },
    });
  }

  trackRegistrationAbandon(step: number, stepName: string, playerData?: GAPlayerData) {
    this.logEvent('registration_abandon', {
      event_category: 'registration',
      event_label: 'form_abandoned',
      value: step,
      custom_parameters: {
        abandoned_at_step: step,
        abandoned_step_name: stepName,
        ...playerData,
      },
    });
  }

  // Payment events
  trackPaymentInitiated(paymentData: GAPaymentData, playerData?: GAPlayerData) {
    this.logEvent('payment_initiated', {
      event_category: 'payment',
      event_label: 'payment_started',
      value: paymentData.amount,
      currency: paymentData.currency || 'INR',
      custom_parameters: {
        ...paymentData,
        ...playerData,
      },
    });
  }

  trackPaymentCompleted(paymentData: GAPaymentData, playerData?: GAPlayerData) {
    this.logEvent('payment_completed', {
      event_category: 'payment',
      event_label: 'payment_successful',
      value: paymentData.amount,
      currency: paymentData.currency || 'INR',
      custom_parameters: {
        ...paymentData,
        ...playerData,
      },
    });
  }

  trackPaymentFailed(paymentData: GAPaymentData, errorReason?: string, playerData?: GAPlayerData) {
    this.logEvent('payment_failed', {
      event_category: 'payment',
      event_label: 'payment_error',
      custom_parameters: {
        ...paymentData,
        error_reason: errorReason,
        ...playerData,
      },
    });
  }

  trackPaymentCancelled(paymentData: GAPaymentData, playerData?: GAPlayerData) {
    this.logEvent('payment_cancelled', {
      event_category: 'payment',
      event_label: 'payment_cancelled',
      value: paymentData.amount,
      currency: paymentData.currency || 'INR',
      custom_parameters: {
        ...paymentData,
        ...playerData,
      },
    });
  }

  // User engagement events
  trackButtonClick(buttonName: string, buttonLocation: string, additionalData?: any) {
    this.logEvent('button_click', {
      event_category: 'engagement',
      event_label: buttonName,
      custom_parameters: {
        button_location: buttonLocation,
        ...additionalData,
      },
    });
  }

  trackFormInteraction(formName: string, interactionType: string, fieldName?: string) {
    this.logEvent('form_interaction', {
      event_category: 'engagement',
      event_label: `${formName}_${interactionType}`,
      custom_parameters: {
        form_name: formName,
        interaction_type: interactionType,
        field_name: fieldName,
      },
    });
  }

  trackDownload(downloadType: string, fileName?: string) {
    this.logEvent('file_download', {
      event_category: 'engagement',
      event_label: downloadType,
      custom_parameters: {
        download_type: downloadType,
        file_name: fileName,
      },
    });
  }

  trackShare(shareMethod: string, contentType: string) {
    this.logEvent('share', {
      event_category: 'engagement',
      event_label: shareMethod,
      custom_parameters: {
        share_method: shareMethod,
        content_type: contentType,
      },
    });
  }

  // Custom events for key user actions
  trackUserAction(actionName: string, actionCategory: string, additionalData?: any) {
    this.logEvent(actionName, {
      event_category: actionCategory,
      event_label: actionName,
      custom_parameters: additionalData,
    });
  }

  // Navigation events
  trackNavigation(fromPage: string, toPage: string, navigationMethod: string) {
    this.logEvent('navigation', {
      event_category: 'navigation',
      event_label: `${fromPage}_to_${toPage}`,
      custom_parameters: {
        from_page: fromPage,
        to_page: toPage,
        navigation_method: navigationMethod,
      },
    });
  }

  // Error tracking
  trackError(errorType: string, errorMessage: string, errorLocation?: string) {
    this.logEvent('exception', {
      event_category: 'error',
      event_label: errorType,
      custom_parameters: {
        error_type: errorType,
        error_message: errorMessage,
        error_location: errorLocation,
      },
    });
  }
}

// Create singleton instance
export const googleAnalytics = new GoogleAnalyticsService();

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export default googleAnalytics;
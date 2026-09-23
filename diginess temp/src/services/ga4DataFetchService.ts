/**
 * Google Analytics 4 Data Fetching Service
 * 
 * Note: This service requires a backend implementation to securely access GA4 Data API
 * as it requires service account credentials that should NOT be exposed in frontend code.
 * 
 * Implementation Options:
 * 1. Supabase Edge Functions (Recommended)
 * 2. Separate Node.js backend
 * 3. Cloud Functions (Google Cloud, AWS Lambda, etc.)
 * 
 * Property ID: 494303780
 * Measurement ID: G-R31DRZTRVF
 */

import { supabase } from '@/integrations/supabase/client';

export interface GA4Metrics {
  activeUsers: number;
  sessions: number;
  conversions: number;
  totalRevenue: number;
  averageSessionDuration: number;
  bounceRate: number;
}

export interface GA4UTMReport {
  utm_id: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  date: string;
  users: number;
  sessions: number;
  conversions: number;
  revenue: number;
  newUsers: number;
  bounceRate: number;
  avgSessionDuration: number;
  pageViews: number;
}

export interface GA4ReportResponse {
  data: GA4UTMReport[];
  totalRows: number;
  fetchedRows: number;
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

export interface GA4QRReport {
  qr_code_id: string;
  scans: number;
  registrations: number;
  conversions: number;
  conversionRate: number;
  revenue: number;
}

class GA4DataFetchService {
  private propertyId = '494303780';
  private measurementId = 'G-R31DRZTRVF';
  
  /**
   * Fetch real-time metrics from GA4
   * This requires a backend implementation
   */
  async getRealTimeMetrics(): Promise<GA4Metrics | null> {
    try {
      // Call your backend API or Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('ga4-realtime-metrics', {
        body: { propertyId: this.propertyId },
      });

      if (error) {
        console.error('Error fetching GA4 real-time metrics:', error);
        return null;
      }

      return data as GA4Metrics;
    } catch (error) {
      console.error('Error in getRealTimeMetrics:', error);
      return null;
    }
  }

  /**
   * Fetch UTM campaign performance from GA4 - fetches ALL data
   */
  async getUTMCampaignReport(startDate: string = '30daysAgo', endDate: string = 'today'): Promise<GA4ReportResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('ga4-utm-report', {
        body: {
          startDate,
          endDate,
        },
      });

      if (error) {
        console.error('Error fetching GA4 UTM report:', error);
        return { data: [], totalRows: 0, fetchedRows: 0, dateRange: { startDate, endDate } };
      }

      // Handle both old array format and new object format
      if (Array.isArray(data)) {
        return { data: data as GA4UTMReport[], totalRows: data.length, fetchedRows: data.length, dateRange: { startDate, endDate } };
      }

      return data as GA4ReportResponse;
    } catch (error) {
      console.error('Error in getUTMCampaignReport:', error);
      return { data: [], totalRows: 0, fetchedRows: 0, dateRange: { startDate, endDate } };
    }
  }

  /**
   * Fetch QR code performance from GA4
   */
  async getQRCodeReport(startDate: string, endDate: string): Promise<GA4QRReport[]> {
    try {
      const { data, error } = await supabase.functions.invoke('ga4-qr-report', {
        body: {
          propertyId: this.propertyId,
          startDate,
          endDate,
          filters: {
            'customEvent:qr_code': 'yes',
          },
        },
      });

      if (error) {
        console.error('Error fetching GA4 QR report:', error);
        return [];
      }

      return data as GA4QRReport[];
    } catch (error) {
      console.error('Error in getQRCodeReport:', error);
      return [];
    }
  }

  /**
   * Fetch comparison data between Supabase and GA4
   */
  async getDataComparison(startDate: string, endDate: string) {
    try {
      // Fetch from Supabase
      const { data: supabaseData, error: sbError } = await supabase
        .from('utm_summary')
        .select('*');

      if (sbError) {
        console.error('Error fetching Supabase data:', sbError);
      }

      // Fetch from GA4
      const ga4Data = await this.getUTMCampaignReport(startDate, endDate);

      return {
        supabase: supabaseData || [],
        ga4: ga4Data,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error in getDataComparison:', error);
      return null;
    }
  }

  /**
   * Mock data for development (when backend is not set up)
   */
  async getMockMetrics(): Promise<GA4Metrics> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      activeUsers: Math.floor(Math.random() * 1000) + 500,
      sessions: Math.floor(Math.random() * 5000) + 1000,
      conversions: Math.floor(Math.random() * 100) + 50,
      totalRevenue: Math.floor(Math.random() * 50000) + 10000,
      averageSessionDuration: Math.floor(Math.random() * 300) + 120,
      bounceRate: Math.random() * 0.5 + 0.2,
    };
  }

  /**
   * Check if GA4 backend is configured
   */
  async isBackendConfigured(): Promise<boolean> {
    try {
      const { data } = await supabase.functions.invoke('ga4-health-check');
      return data?.status === 'ok';
    } catch {
      return false;
    }
  }
}

// Singleton instance
export const ga4DataFetchService = new GA4DataFetchService();

export default ga4DataFetchService;

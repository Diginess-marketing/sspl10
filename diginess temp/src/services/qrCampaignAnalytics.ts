/**
 * Enhanced Campaign Analytics with QR Code Attribution
 * 
 * This module provides unified analytics combining:
 * - UTM campaign tracking
 * - QR code scan metrics
 * - Registration conversions
 * - Payment conversions
 * 
 * Usage:
 * import { QRCampaignAnalytics } from '@/services/qrCampaignAnalytics';
 * 
 * const analytics = await QRCampaignAnalytics.getUnifiedReport();
 * const qrPerformance = await QRCampaignAnalytics.getQRCodePerformance();
 */

import { supabase } from '@/integrations/supabase/client';

export interface UnifiedTrackingReport {
  utm_campaign: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_content: string | null;
  utm_term: string | null;
  qr_code_id: string | null;
  qr_code_title: string | null;
  qr_target_url: string | null;
  qr_channel: string | null;
  total_registrations: number;
  unique_users: number;
  total_paid: number;
  total_revenue: number;
  conversion_rate: number;
  avg_revenue_per_user: number;
  total_qr_scans: number;
  unique_scan_ips: number;
  scan_to_registration_rate: number;
  scan_to_payment_rate: number;
  first_registration_date: string;
  last_registration_date: string;
  first_scan_date: string | null;
  last_scan_date: string | null;
  mobile_scans: number;
  desktop_scans: number;
  tablet_scans: number;
}

export interface QRCodePerformance {
  qr_code_id: string;
  qr_code_title: string;
  target_url: string;
  channel: string | null;
  is_active: boolean;
  total_scans_from_qr_table: number;
  total_scans: number;
  unique_visitors: number;
  total_registrations: number;
  total_paid_registrations: number;
  total_revenue: number;
  avg_revenue_per_paid_user: number;
  scan_to_registration_rate: number;
  scan_to_payment_rate: number;
  registration_to_payment_rate: number;
  qr_created_at: string;
  first_scan_date: string | null;
  last_scan_date: string | null;
  first_registration_date: string | null;
  last_registration_date: string | null;
}

export interface CampaignWithQRMetrics {
  utm_campaign: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_content: string | null;
  utm_term: string | null;
  total_registrations: number;
  unique_users: number;
  total_paid: number;
  total_revenue: number;
  conversion_rate: number;
  avg_revenue_per_paid_user: number;
  registrations_from_qr: number;
  unique_qr_codes_used: number;
  first_registration_date: string;
  last_registration_date: string;
}

export interface AnalyticsFilters {
  utm_campaign?: string;
  utm_source?: string;
  utm_medium?: string;
  qr_code_id?: string;
  qr_channel?: string;
  minRevenue?: number;
  minConversionRate?: number;
  startDate?: string;
  endDate?: string;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class QRCampaignAnalytics {
  /**
   * Get unified tracking report combining QR scans, UTM, and payments
   */
  static async getUnifiedReport(filters: AnalyticsFilters = {}): Promise<{
    success: boolean;
    data: UnifiedTrackingReport[];
    count: number;
    error?: string;
  }> {
    try {
      let query = (supabase as any)
        .from('unified_tracking_report')
        .select('*');

      // Apply filters
      if (filters.utm_campaign) {
        query = query.eq('utm_campaign', filters.utm_campaign);
      }
      if (filters.utm_source) {
        query = query.eq('utm_source', filters.utm_source);
      }
      if (filters.utm_medium) {
        query = query.eq('utm_medium', filters.utm_medium);
      }
      if (filters.qr_code_id) {
        query = query.eq('qr_code_id', filters.qr_code_id);
      }
      if (filters.qr_channel) {
        query = query.eq('qr_channel', filters.qr_channel);
      }
      if (filters.minRevenue) {
        query = query.gte('total_revenue', filters.minRevenue);
      }
      if (filters.minConversionRate) {
        query = query.gte('conversion_rate', filters.minConversionRate);
      }
      if (filters.startDate) {
        query = query.gte('first_registration_date', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('last_registration_date', filters.endDate);
      }

      // Apply sorting
      const sortBy = filters.sortBy || 'total_revenue';
      const sortOrder = filters.sortOrder || 'desc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Apply limit
      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      return {
        success: true,
        data: data as UnifiedTrackingReport[],
        count: data?.length || 0,
      };
    } catch (error: any) {
      console.error('Error fetching unified report:', error);
      return {
        success: false,
        data: [],
        count: 0,
        error: error.message,
      };
    }
  }

  /**
   * Get QR code performance metrics with conversion rates
   */
  static async getQRCodePerformance(filters: AnalyticsFilters = {}): Promise<{
    success: boolean;
    data: QRCodePerformance[];
    count: number;
    error?: string;
  }> {
    try {
      let query = (supabase as any)
        .from('qr_code_performance')
        .select('*');

      // Apply filters
      if (filters.qr_code_id) {
        query = query.eq('qr_code_id', filters.qr_code_id);
      }
      if (filters.qr_channel) {
        query = query.eq('channel', filters.qr_channel);
      }
      if (filters.minRevenue) {
        query = query.gte('total_revenue', filters.minRevenue);
      }
      if (filters.minConversionRate) {
        query = query.gte('scan_to_payment_rate', filters.minConversionRate);
      }

      // Apply sorting
      const sortBy = filters.sortBy || 'total_revenue';
      const sortOrder = filters.sortOrder || 'desc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Apply limit
      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      return {
        success: true,
        data: data as QRCodePerformance[],
        count: data?.length || 0,
      };
    } catch (error: any) {
      console.error('Error fetching QR code performance:', error);
      return {
        success: false,
        data: [],
        count: 0,
        error: error.message,
      };
    }
  }

  /**
   * Get enhanced campaign report with QR metrics
   */
  static async getCampaignReport(filters: AnalyticsFilters = {}): Promise<{
    success: boolean;
    data: CampaignWithQRMetrics[];
    count: number;
    error?: string;
  }> {
    try {
      let query = (supabase as any)
        .from('utm_campaign_report')
        .select('*');

      // Apply filters
      if (filters.utm_campaign) {
        query = query.eq('utm_campaign', filters.utm_campaign);
      }
      if (filters.utm_source) {
        query = query.eq('utm_source', filters.utm_source);
      }
      if (filters.utm_medium) {
        query = query.eq('utm_medium', filters.utm_medium);
      }
      if (filters.minRevenue) {
        query = query.gte('total_revenue', filters.minRevenue);
      }
      if (filters.minConversionRate) {
        query = query.gte('conversion_rate', filters.minConversionRate);
      }

      // Apply sorting
      const sortBy = filters.sortBy || 'total_revenue';
      const sortOrder = filters.sortOrder || 'desc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Apply limit
      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      return {
        success: true,
        data: data as CampaignWithQRMetrics[],
        count: data?.length || 0,
      };
    } catch (error: any) {
      console.error('Error fetching campaign report:', error);
      return {
        success: false,
        data: [],
        count: 0,
        error: error.message,
      };
    }
  }

  /**
   * Get summary statistics across all campaigns and QR codes
   */
  static async getSummaryStatistics(): Promise<{
    success: boolean;
    data: {
      total_campaigns: number;
      total_qr_codes: number;
      total_scans: number;
      total_registrations: number;
      total_paid: number;
      total_revenue: number;
      overall_conversion_rate: number;
      overall_scan_to_registration_rate: number;
      overall_scan_to_payment_rate: number;
      avg_revenue_per_paid_user: number;
      registrations_from_qr: number;
      registrations_from_direct: number;
    };
    error?: string;
  }> {
    try {
      // Fetch unified report for aggregation
      const { data: unifiedData, error: unifiedError } = await (supabase as any)
        .from('unified_tracking_report')
        .select('*');

      if (unifiedError) throw unifiedError;

      // Fetch QR performance for scan metrics
      const { data: qrData, error: qrError } = await (supabase as any)
        .from('qr_code_performance')
        .select('*');

      if (qrError) throw qrError;

      // Calculate summary statistics
      const uniqueCampaigns = new Set(
        unifiedData?.map((r: any) => r.utm_campaign).filter(Boolean),
      ).size;
      
      const uniqueQRCodes = new Set(
        unifiedData?.map((r: any) => r.qr_code_id).filter(Boolean),
      ).size;

      const totalScans = qrData?.reduce((sum: number, qr: any) => sum + (qr.total_scans || 0), 0) || 0;
      const totalRegistrations = unifiedData?.reduce((sum: number, r: any) => sum + (r.total_registrations || 0), 0) || 0;
      const totalPaid = unifiedData?.reduce((sum: number, r: any) => sum + (r.total_paid || 0), 0) || 0;
      const totalRevenue = unifiedData?.reduce((sum: number, r: any) => sum + (r.total_revenue || 0), 0) || 0;

      const registrationsFromQR = unifiedData?.reduce(
        (sum: number, r: any) => sum + (r.qr_code_id ? r.total_registrations : 0), 0,
      ) || 0;
      
      const registrationsFromDirect = totalRegistrations - registrationsFromQR;

      const overallConversionRate = totalRegistrations > 0 
        ? (totalPaid / totalRegistrations) * 100 
        : 0;

      const overallScanToRegistrationRate = totalScans > 0 
        ? (totalRegistrations / totalScans) * 100 
        : 0;

      const overallScanToPaymentRate = totalScans > 0 
        ? (totalPaid / totalScans) * 100 
        : 0;

      const avgRevenuePerPaidUser = totalPaid > 0 
        ? totalRevenue / totalPaid 
        : 0;

      return {
        success: true,
        data: {
          total_campaigns: uniqueCampaigns,
          total_qr_codes: uniqueQRCodes,
          total_scans: totalScans,
          total_registrations: totalRegistrations,
          total_paid: totalPaid,
          total_revenue: totalRevenue,
          overall_conversion_rate: Math.round(overallConversionRate * 100) / 100,
          overall_scan_to_registration_rate: Math.round(overallScanToRegistrationRate * 100) / 100,
          overall_scan_to_payment_rate: Math.round(overallScanToPaymentRate * 100) / 100,
          avg_revenue_per_paid_user: Math.round(avgRevenuePerPaidUser * 100) / 100,
          registrations_from_qr: registrationsFromQR,
          registrations_from_direct: registrationsFromDirect,
        },
      };
    } catch (error: any) {
      console.error('Error fetching summary statistics:', error);
      return {
        success: false,
        data: {
          total_campaigns: 0,
          total_qr_codes: 0,
          total_scans: 0,
          total_registrations: 0,
          total_paid: 0,
          total_revenue: 0,
          overall_conversion_rate: 0,
          overall_scan_to_registration_rate: 0,
          overall_scan_to_payment_rate: 0,
          avg_revenue_per_paid_user: 0,
          registrations_from_qr: 0,
          registrations_from_direct: 0,
        },
        error: error.message,
      };
    }
  }

  /**
   * Get top performing QR codes by revenue
   */
  static async getTopQRCodes(limit: number = 10): Promise<{
    success: boolean;
    data: QRCodePerformance[];
    error?: string;
  }> {
    return this.getQRCodePerformance({
      limit,
      sortBy: 'total_revenue',
      sortOrder: 'desc',
    });
  }

  /**
   * Get top performing campaigns by revenue
   */
  static async getTopCampaigns(limit: number = 10): Promise<{
    success: boolean;
    data: CampaignWithQRMetrics[];
    error?: string;
  }> {
    return this.getCampaignReport({
      limit,
      sortBy: 'total_revenue',
      sortOrder: 'desc',
    });
  }

  /**
   * Get attribution breakdown (QR vs Direct vs UTM sources)
   */
  static async getAttributionBreakdown(): Promise<{
    success: boolean;
    data: {
      source: string;
      registrations: number;
      paid: number;
      revenue: number;
      conversion_rate: number;
      percentage_of_total: number;
    }[];
    error?: string;
  }> {
    try {
      const { data: unifiedData, error } = await (supabase as any)
        .from('unified_tracking_report')
        .select('*');

      if (error) throw error;

      const totalRegistrations = unifiedData?.reduce(
        (sum: number, r: any) => sum + (r.total_registrations || 0), 0,
      ) || 0;

      // Group by attribution source
      const breakdown: Record<string, any> = {};

      unifiedData?.forEach((row: any) => {
        let source = 'Direct Traffic';
        
        if (row.qr_code_id) {
          source = `QR - ${row.qr_channel || 'Unknown Channel'}`;
        } else if (row.utm_source) {
          source = `UTM - ${row.utm_source}`;
        } else if (row.utm_campaign) {
          source = `Campaign - ${row.utm_campaign}`;
        }

        if (!breakdown[source]) {
          breakdown[source] = {
            source,
            registrations: 0,
            paid: 0,
            revenue: 0,
          };
        }

        breakdown[source].registrations += row.total_registrations || 0;
        breakdown[source].paid += row.total_paid || 0;
        breakdown[source].revenue += row.total_revenue || 0;
      });

      // Calculate conversion rates and percentages
      const results = Object.values(breakdown).map(item => ({
        ...item,
        conversion_rate: item.registrations > 0 
          ? Math.round((item.paid / item.registrations) * 10000) / 100
          : 0,
        percentage_of_total: totalRegistrations > 0 
          ? Math.round((item.registrations / totalRegistrations) * 10000) / 100
          : 0,
      }));

      // Sort by registrations descending
      results.sort((a, b) => b.registrations - a.registrations);

      return {
        success: true,
        data: results,
      };
    } catch (error: any) {
      console.error('Error fetching attribution breakdown:', error);
      return {
        success: false,
        data: [],
        error: error.message,
      };
    }
  }
}

export default QRCampaignAnalytics;

/**
 * Registration Analytics Service
 * Provides comprehensive analytics for UTM, QR code, and payment attribution
 */

import { supabase } from '@/integrations/supabase/client';

// Define valid paid statuses globally for consistency
const PAID_STATUSES = ['completed', 'captured', 'paid', 'success'];

export interface RegistrationWithUTM {
  registration_id: string;
  full_name: string;
  email: string;
  phone: string;
  state: string;
  city: string;
  date_of_birth: string;
  position: string;
  status: string;
  payment_status: string;
  payment_amount: number | null;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  registration_date: string;
  updated_at: string;
  // UTM data
  utm_id: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  // QR Code data
  qr_code_id: string | null;
  qr_title: string | null;
  qr_channel: string | null;
  qr_target_url: string | null;
  // Computed fields
  revenue: number;
  has_utm_attribution: boolean;
  is_qr_sourced: boolean;
}

export interface CampaignPerformance {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  total_registrations: number;
  paid_registrations: number;
  pending_registrations: number;
  failed_registrations: number;
  total_revenue: number;
  conversion_rate: number;
  first_registration: string;
  last_registration: string;
}

export interface QRCodePerformance {
  qr_id: string;
  qr_code: string;
  qr_title: string;
  qr_channel: string;
  target_url: string;
  qr_created_at: string;
  total_scans: number;
  unique_scans: number;
  total_registrations: number;
  paid_registrations: number;
  total_revenue: number;
  scan_to_registration_rate: number;
  registration_to_payment_rate: number;
}

export interface AnalyticsSummary {
  total_registrations: number;
  paid_registrations: number;
  pending_registrations: number;
  failed_registrations: number;
  total_revenue: number;
  utm_attributed_registrations: number;
  qr_sourced_registrations: number;
  conversion_rate: number;
  average_payment: number;
}

export interface DateRangeFilter {
  startDate?: string;
  endDate?: string;
}

export interface UTMFilter extends DateRangeFilter {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

class RegistrationAnalyticsService {
  /**
   * Helper to map player_registration row to RegistrationWithUTM
   */
  private mapRegistrationRow(row: any): RegistrationWithUTM {
    const isPaid = PAID_STATUSES.includes((row.payment_status || '').toLowerCase());
    return {
      registration_id: row.id,
      full_name: row.full_name,
      email: row.email,
      phone: row.phone,
      state: row.state,
      city: row.city,
      date_of_birth: row.date_of_birth,
      position: row.position,
      status: row.status || 'pending', // Default to pending if missing
      payment_status: row.payment_status,
      payment_amount: row.payment_amount,
      razorpay_order_id: row.razorpay_order_id,
      razorpay_payment_id: row.razorpay_payment_id,
      registration_date: row.created_at,
      updated_at: row.updated_at,
      // UTM data (direct columns from player_registrations)
      utm_id: null, // Not directly available in flat table, but not critical
      utm_source: row.utm_source,
      utm_medium: row.utm_medium,
      utm_campaign: row.utm_campaign,
      utm_content: row.utm_content,
      utm_term: row.utm_term,
      // QR Code data
      qr_code_id: row.qr_code_id,
      qr_title: null, // Would need join, skipping for now as usually not critical for list
      qr_channel: null,
      qr_target_url: null,
      // Computed fields
      revenue: isPaid ? (row.payment_amount || 0) : 0,
      has_utm_attribution: Boolean(row.utm_source || row.utm_campaign),
      is_qr_sourced: Boolean(row.qr_code_id),
    };
  }

  /**
   * Get all registrations with UTM attribution data
   * REFACTORED: Queries player_registrations directly to bypass faulty view
   */
  async getRegistrationsWithUTM(filter?: UTMFilter): Promise<RegistrationWithUTM[]> {
    try {
      let query = supabase
        .from('player_registrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter?.startDate) {
        query = query.gte('created_at', filter.startDate);
      }
      if (filter?.endDate) {
        query = query.lte('created_at', filter.endDate);
      }
      if (filter?.utm_source) {
        query = query.eq('utm_source', filter.utm_source);
      }
      if (filter?.utm_medium) {
        query = query.eq('utm_medium', filter.utm_medium);
      }
      if (filter?.utm_campaign) {
        query = query.eq('utm_campaign', filter.utm_campaign);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching registrations with UTM:', error);
        throw error;
      }

      return (data || []).map(this.mapRegistrationRow);
    } catch (error) {
      console.error('Error in getRegistrationsWithUTM:', error);
      return [];
    }
  }

  /**
   * Get campaign performance metrics
   * REFACTORED: Aggregates from player_registrations
   */
  async getCampaignPerformance(filter?: DateRangeFilter): Promise<CampaignPerformance[]> {
    try {
      // Fetch all registrations within date range (optimized selection)
      let query = supabase
        .from('player_registrations')
        .select('utm_source, utm_medium, utm_campaign, payment_status, payment_amount, created_at');

      if (filter?.startDate) {
        query = query.gte('created_at', filter.startDate);
      }
      if (filter?.endDate) {
        query = query.lte('created_at', filter.endDate);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching data for campaign performance:', error);
        throw error;
      }

      // Aggregate in memory
      const campaigns = new Map<string, CampaignPerformance>();

      (data || []).forEach((row: any) => {
        // Key by unique campaign combo
        const source = row.utm_source || '(direct)';
        const medium = row.utm_medium || '(none)';
        const campaignName = row.utm_campaign || '(not set)';
        const key = `${source}|${medium}|${campaignName}`;

        if (!campaigns.has(key)) {
          campaigns.set(key, {
            utm_source: source,
            utm_medium: medium,
            utm_campaign: campaignName,
            total_registrations: 0,
            paid_registrations: 0,
            pending_registrations: 0,
            failed_registrations: 0,
            total_revenue: 0,
            conversion_rate: 0,
            first_registration: row.created_at,
            last_registration: row.created_at,
          });
        }

        const metrics = campaigns.get(key)!;
        metrics.total_registrations++;

        const status = (row.payment_status || '').toLowerCase();
        const isPaid = PAID_STATUSES.includes(status);

        if (isPaid) {
          metrics.paid_registrations++;
          metrics.total_revenue += (row.payment_amount || 0);
        } else if (status === 'failed' || status === 'error') {
          metrics.failed_registrations++;
        } else {
          metrics.pending_registrations++;
        }

        // Update timestamps
        if (row.created_at < metrics.first_registration) metrics.first_registration = row.created_at;
        if (row.created_at > metrics.last_registration) metrics.last_registration = row.created_at;
      });

      // Calculate rates and convert to array
      return Array.from(campaigns.values()).map(c => ({
        ...c,
        conversion_rate: c.total_registrations > 0
          ? (c.paid_registrations / c.total_registrations) * 100
          : 0,
      })).sort((a, b) => b.total_revenue - a.total_revenue);

    } catch (error) {
      console.error('Error in getCampaignPerformance:', error);
      return [];
    }
  }

  /**
   * Get QR code performance metrics
   * Keeping original Implementation for now unless QR views are also broken. 
   * Assuming QR views might be broken too, let's play safe and refactor if it uses similar logic.
   * However, let's stick to the critical path first.
   */
  async getQRCodePerformance(): Promise<QRCodePerformance[]> {
    try {
      const { data, error } = await supabase
        .from('qr_code_performance' as any)
        .select('*')
        .order('total_revenue', { ascending: false });

      if (error) {
        console.error('Error fetching QR code performance:', error);
        throw error;
      }

      return (data || []) as unknown as QRCodePerformance[];
    } catch (error) {
      console.error('Error in getQRCodePerformance:', error);
      return [];
    }
  }

  /**
   * Get overall analytics summary
   * REFACTORED: Uses robust payment status check
   */
  async getAnalyticsSummary(filter?: DateRangeFilter): Promise<AnalyticsSummary> {
    try {
      // Query player_registrations directly for summary
      let query = supabase
        .from('player_registrations')
        .select('id, payment_status, payment_amount, utm_source, qr_code_id');

      if (filter?.startDate) {
        query = query.gte('created_at', filter.startDate);
      }
      if (filter?.endDate) {
        query = query.lte('created_at', filter.endDate);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching analytics summary:', error);
        throw error;
      }

      const registrations = (data || []) as any[];
      const total = registrations.length;

      const paid = registrations.filter(r =>
        PAID_STATUSES.includes((r.payment_status || '').toLowerCase()),
      );

      const pending = registrations.filter(r =>
        !PAID_STATUSES.includes((r.payment_status || '').toLowerCase()) &&
        !['failed', 'error', 'cancelled'].includes((r.payment_status || '').toLowerCase()),
      );

      const failed = registrations.filter(r =>
        ['failed', 'error', 'cancelled'].includes((r.payment_status || '').toLowerCase()),
      );

      const utmAttributed = registrations.filter(r => r.utm_source);
      const qrSourced = registrations.filter(r => r.qr_code_id);

      const totalRevenue = paid.reduce((sum, r) => sum + (r.payment_amount || 0), 0);

      return {
        total_registrations: total,
        paid_registrations: paid.length,
        pending_registrations: pending.length,
        failed_registrations: failed.length,
        total_revenue: totalRevenue,
        utm_attributed_registrations: utmAttributed.length,
        qr_sourced_registrations: qrSourced.length,
        conversion_rate: total > 0 ? Math.round((paid.length / total) * 100 * 100) / 100 : 0,
        average_payment: paid.length > 0 ? Math.round(totalRevenue / paid.length) : 0,
      };
    } catch (error) {
      console.error('Error in getAnalyticsSummary:', error);
      return {
        total_registrations: 0,
        paid_registrations: 0,
        pending_registrations: 0,
        failed_registrations: 0,
        total_revenue: 0,
        utm_attributed_registrations: 0,
        qr_sourced_registrations: 0,
        conversion_rate: 0,
        average_payment: 0,
      };
    }
  }

  /**
   * Get registrations by UTM campaign
   */
  async getRegistrationsByCampaign(campaignName: string): Promise<RegistrationWithUTM[]> {
    return this.getRegistrationsWithUTM({ utm_campaign: campaignName });
  }

  /**
   * Get registrations by QR code
   */
  async getRegistrationsByQRCode(qrCodeId: string): Promise<RegistrationWithUTM[]> {
    try {
      // Use getRegistrationsWithUTM logic but filter by QR locally or via query if we added it to filter
      // For now, let's just query directly properly
      const { data, error } = await supabase
        .from('player_registrations')
        .select('*')
        .eq('qr_code_id', qrCodeId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching registrations by QR code:', error);
        throw error;
      }

      return (data || []).map(this.mapRegistrationRow);
    } catch (error) {
      console.error('Error in getRegistrationsByQRCode:', error);
      return [];
    }
  }

  /**
   * Get paid users with UTM attribution
   * REFACTORED: Use robust payment statuses
   */
  async getPaidUsersWithAttribution(filter?: UTMFilter): Promise<RegistrationWithUTM[]> {
    try {
      let query = supabase
        .from('player_registrations')
        .select('*')
        // We can't use .in() easily with other filters in a clean way without checking docs if they handle OR logic well,
        // but .in('payment_status', PAID_STATUSES) works for Exact Match.
        // However, 'paid' vs 'PAID' case sensitivity?
        // Supabase/Postgres is case sensitive.
        // Let's assume lower case in DB or exact match.
        // We will fetch more and filter in JS to be safe, OR use .in() provided DB uses standard values.
        // The DB values seen are 'captured' (lowercase).
        .in('payment_status', PAID_STATUSES)
        .order('created_at', { ascending: false });

      if (filter?.startDate) {
        query = query.gte('created_at', filter.startDate);
      }
      if (filter?.endDate) {
        query = query.lte('created_at', filter.endDate);
      }
      if (filter?.utm_source) {
        query = query.eq('utm_source', filter.utm_source);
      }
      if (filter?.utm_campaign) {
        query = query.eq('utm_campaign', filter.utm_campaign);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching paid users:', error);
        throw error;
      }

      return (data || []).map(this.mapRegistrationRow);
    } catch (error) {
      console.error('Error in getPaidUsersWithAttribution:', error);
      return [];
    }
  }

  /**
   * Get revenue breakdown by source
   * REFACTORED: Use robust payment statuses
   */
  async getRevenueBySource(): Promise<{ source: string; revenue: number; count: number }[]> {
    try {
      const { data, error } = await supabase
        .from('player_registrations')
        .select('utm_source, payment_amount, payment_status')
        .in('payment_status', PAID_STATUSES);

      if (error) {
        console.error('Error fetching revenue by source:', error);
        throw error;
      }

      // Group by source
      const sourceMap = new Map<string, { revenue: number; count: number }>();

      ((data || []) as any[]).forEach(row => {
        const source = row.utm_source || 'direct';
        const existing = sourceMap.get(source) || { revenue: 0, count: 0 };
        existing.revenue += row.payment_amount || 0;
        existing.count += 1;
        sourceMap.set(source, existing);
      });

      return Array.from(sourceMap.entries())
        .map(([source, data]) => ({ source, ...data }))
        .sort((a, b) => b.revenue - a.revenue);
    } catch (error) {
      console.error('Error in getRevenueBySource:', error);
      return [];
    }
  }

  /**
   * Get daily registration and revenue trends
   * REFACTORED: Use robust payment statuses
   */
  async getDailyTrends(days: number = 30): Promise<{ date: string; registrations: number; revenue: number; paid: number }[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('player_registrations')
        .select('created_at, payment_status, payment_amount')
        .gte('created_at', startDate.toISOString());

      if (error) {
        console.error('Error fetching daily trends:', error);
        throw error;
      }

      // Group by date
      const dateMap = new Map<string, { registrations: number; revenue: number; paid: number }>();

      ((data || []) as any[]).forEach(row => {
        const date = new Date(row.created_at).toISOString().split('T')[0];
        const existing = dateMap.get(date) || { registrations: 0, revenue: 0, paid: 0 };
        existing.registrations += 1;

        const status = (row.payment_status || '').toLowerCase();
        if (PAID_STATUSES.includes(status)) {
          existing.revenue += row.payment_amount || 0;
          existing.paid += 1;
        }
        dateMap.set(date, existing);
      });

      return Array.from(dateMap.entries())
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => a.date.localeCompare(b.date));
    } catch (error) {
      console.error('Error in getDailyTrends:', error);
      return [];
    }
  }

  /**
   * Export registrations to CSV
   */
  async exportToCSV(filter?: UTMFilter): Promise<string> {
    const data = await this.getRegistrationsWithUTM(filter);

    const headers = [
      'Registration ID',
      'Full Name',
      'Email',
      'Phone',
      'State',
      'City',
      'Date of Birth',
      'Position',
      'Status',
      'Payment Status',
      'Payment Amount',
      'Registration Date',
      'UTM Source',
      'UTM Medium',
      'UTM Campaign',
      'UTM Content',
      'QR Code ID',
      'QR Title',
    ];

    const rows = data.map(row => [
      row.registration_id,
      row.full_name,
      row.email,
      row.phone,
      row.state,
      row.city,
      row.date_of_birth,
      row.position,
      row.status,
      row.payment_status,
      row.payment_amount || '',
      row.registration_date,
      row.utm_source || '',
      row.utm_medium || '',
      row.utm_campaign || '',
      row.utm_content || '',
      row.qr_code_id || '',
      row.qr_title || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    return csvContent;
  }

  /**
   * Download CSV file
   */
  async downloadCSV(filter?: UTMFilter, filename?: string): Promise<void> {
    const csvContent = await this.exportToCSV(filter);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename || `registrations_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export const registrationAnalyticsService = new RegistrationAnalyticsService();
export default registrationAnalyticsService;

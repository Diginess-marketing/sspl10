/**
 * Advanced UTM Analytics Service
 * 
 * This service provides additional utilities for:
 * - Fetching detailed analytics
 * - Exporting data
 * - Real-time event monitoring
 */

import { supabase } from '@/integrations/supabase/client';

export class UTMAnalyticsService {
  /**
   * Get detailed analytics for a specific UTM ID
   */
  static async getDetailedAnalytics(utmId) {
    try {
      const { data, error } = await supabase
        .from('utm_events')
        .select('*')
        .eq('utm_id', utmId)
        .order('timestamp', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching detailed analytics:', error);
      return null;
    }
  }

  /**
   * Get registration details with player information
   */
  static async getRegistrationDetails(utmId = null) {
    try {
      // Get all registration events
      let query = supabase
        .from('utm_events')
        .select('*')
        .eq('event_type', 'registration');

      if (utmId) {
        query = query.eq('utm_id', utmId);
      }

      const { data: registrationEvents, error: regError } = await query.order('timestamp', { ascending: false });

      if (regError) throw regError;

      // Get registration IDs
      const registrationIds = (registrationEvents || [])
        .map(e => e.registration_id)
        .filter(id => id !== null);

      if (registrationIds.length === 0) {
        return [];
      }

      // Fetch player details from registrations table
      const { data: playerDetails, error: playerError } = await supabase
        .from('registrations')
        .select('id, name, mobile, email, city, created_at, payment_status')
        .in('id', registrationIds);

      if (playerError) throw playerError;

      // Merge registration events with player details
      const mergedData = (registrationEvents || []).map(event => {
        const player = (playerDetails || []).find(p => p.id === event.registration_id);
        return {
          ...event,
          player_name: player?.name || 'N/A',
          player_mobile: player?.mobile || 'N/A',
          player_email: player?.email || 'N/A',
          player_city: player?.city || 'N/A',
          registration_date: player?.created_at || null,
          payment_status: player?.payment_status || 'pending',
        };
      });

      return mergedData;
    } catch (error) {
      console.error('Error fetching registration details:', error);
      return [];
    }
  }

  /**
   * Get campaign details with source and medium
   */
  static async getCampaignDetails() {
    try {
      const { data: events, error } = await supabase
        .from('utm_events')
        .select('utm_id, utm_campaign, utm_source, utm_medium, event_type, registration_id')
        .order('timestamp', { ascending: false });

      if (error) throw error;

      // Group by utm_id and get unique campaign details
      const campaigns = {};
      (events || []).forEach(event => {
        if (event.utm_id && !campaigns[event.utm_id]) {
          campaigns[event.utm_id] = {
            utm_id: event.utm_id,
            campaign_name: event.utm_campaign || 'N/A',
            source: event.utm_source || 'N/A',
            medium: event.utm_medium || 'N/A',
          };
        }
      });

      return Object.values(campaigns);
    } catch (error) {
      console.error('Error fetching campaign details:', error);
      return [];
    }
  }

  /**
   * Get summary statistics
   */
  static async getSummaryStats() {
    try {
      const { data, error } = await supabase
        .from('utm_summary')
        .select('*')
        .order('scans', { ascending: false });

      if (error) throw error;

      // Calculate totals
      const totals = {
        total_scans: 0,
        total_registrations: 0,
        total_paid: 0,
        sources: [],
      };

      (data || []).forEach((row) => {
        totals.total_scans += row.scans || 0;
        totals.total_registrations += row.registrations || 0;
        totals.total_paid += row.paid_registrations || 0;
        totals.sources.push(row);
      });

      totals.overall_conversion = totals.total_scans > 0
        ? ((totals.total_registrations / totals.total_scans) * 100).toFixed(2)
        : 0;

      totals.payment_conversion = totals.total_registrations > 0
        ? ((totals.total_paid / totals.total_registrations) * 100).toFixed(2)
        : 0;

      return totals;
    } catch (error) {
      console.error('Error fetching summary stats:', error);
      return null;
    }
  }

  /**
   * Get events in date range
   */
  static async getEventsByDateRange(startDate, endDate, eventType = null) {
    try {
      let query = supabase
        .from('utm_events')
        .select('*')
        .gte('timestamp', startDate)
        .lte('timestamp', endDate);

      if (eventType) {
        query = query.eq('event_type', eventType);
      }

      const { data, error } = await query.order('timestamp', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching events by date range:', error);
      return null;
    }
  }

  /**
   * Get registration funnel data
   */
  static async getRegistrationFunnel(utmId) {
    try {
      const { data: events, error } = await supabase
        .from('utm_events')
        .select('*')
        .eq('utm_id', utmId);

      if (error) throw error;

      const funnel = {
        scans: (events || []).filter((e) => e.event_type === 'scan').length,
        registrations: new Set(
          (events || [])
            .filter((e) => e.event_type === 'registration')
            .map((e) => e.registration_id)
        ).size,
        payments: new Set(
          (events || [])
            .filter((e) => e.event_type === 'payment')
            .map((e) => e.registration_id)
        ).size,
      };

      return {
        ...funnel,
        scan_to_register: funnel.scans > 0 ? ((funnel.registrations / funnel.scans) * 100).toFixed(2) : 0,
        register_to_pay: funnel.registrations > 0 ? ((funnel.payments / funnel.registrations) * 100).toFixed(2) : 0,
      };
    } catch (error) {
      console.error('Error fetching registration funnel:', error);
      return null;
    }
  }

  /**
   * Export data as CSV
   */
  static async exportToCSV(utmId = null) {
    try {
      let query = supabase.from('utm_events').select('*');

      if (utmId) {
        query = query.eq('utm_id', utmId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const csv = this.convertToCSV(data || []);
      return csv;
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      return null;
    }
  }

  /**
   * Convert array of objects to CSV string
   */
  static convertToCSV(data) {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const rows = data.map((obj) =>
      headers.map((header) => {
        const value = obj[header];
        if (value === null) return '';
        if (typeof value === 'object') return JSON.stringify(value);
        if (typeof value === 'string' && value.includes(',')) return `"${value}"`;
        return value;
      })
    );

    return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  }

  /**
   * Subscribe to real-time events
   */
  static subscribeToEvents(callback) {
    return supabase
      .channel('utm_events')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'utm_events',
        },
        callback
      )
      .subscribe();
  }

  /**
   * Get paid users details from utm_payment_users table
   * @param {string|null} utmId - Optional UTM ID to filter by
   * @returns {Promise<Array>} Array of paid user details
   */
  static async getPaidUsersDetails(utmId = null) {
    try {
      let query = supabase
        .from('utm_payment_users')
        .select('*')
        .eq('payment_status', 'success')
        .order('created_at', { ascending: false });

      if (utmId) {
        query = query.eq('utm_id', utmId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching paid users details:', error);
      return [];
    }
  }

  /**
   * Get paid users details using the utm_paid_users_details view
   * This view joins utm_payment_users with registrations for complete data
   * @param {string|null} utmId - Optional UTM ID to filter by
   * @returns {Promise<Array>} Array of detailed paid user records
   */
  static async getPaidUsersDetailedView(utmId = null) {
    try {
      let query = supabase
        .from('utm_paid_users_details')
        .select('*')
        .order('created_at', { ascending: false });

      if (utmId) {
        query = query.eq('utm_id', utmId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching paid users detailed view:', error);
      return [];
    }
  }

  /**
   * Get revenue summary by campaign
   * @returns {Promise<Object>} Revenue statistics grouped by UTM campaign
   */
  static async getRevenueSummary() {
    try {
      const { data, error } = await supabase
        .from('utm_payment_users')
        .select('utm_id, utm_campaign, utm_source, utm_medium, payment_amount')
        .eq('payment_status', 'success');

      if (error) throw error;

      // Group by utm_id and calculate totals
      const revenueByUtm = {};
      (data || []).forEach((record) => {
        const utmId = record.utm_id || 'direct';
        if (!revenueByUtm[utmId]) {
          revenueByUtm[utmId] = {
            utm_id: utmId,
            utm_campaign: record.utm_campaign || 'Direct',
            utm_source: record.utm_source || 'N/A',
            utm_medium: record.utm_medium || 'N/A',
            total_revenue: 0,
            paid_count: 0,
          };
        }
        revenueByUtm[utmId].total_revenue += parseFloat(record.payment_amount) || 0;
        revenueByUtm[utmId].paid_count += 1;
      });

      // Calculate averages
      Object.values(revenueByUtm).forEach((utm) => {
        utm.avg_payment = utm.paid_count > 0 ? utm.total_revenue / utm.paid_count : 0;
      });

      return {
        by_campaign: Object.values(revenueByUtm),
        total_revenue: Object.values(revenueByUtm).reduce((sum, u) => sum + u.total_revenue, 0),
        total_paid_users: Object.values(revenueByUtm).reduce((sum, u) => sum + u.paid_count, 0),
      };
    } catch (error) {
      console.error('Error fetching revenue summary:', error);
      return { by_campaign: [], total_revenue: 0, total_paid_users: 0 };
    }
  }

  /**
   * Subscribe to real-time paid users updates
   * @param {Function} callback - Callback function for new paid user events
   * @returns {RealtimeChannel} Supabase channel subscription
   */
  static subscribeToPaidUsers(callback) {
    return supabase
      .channel('utm_payment_users_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'utm_payment_users',
        },
        callback
      )
      .subscribe();
  }

  /**
   * Export paid users data as CSV
   * @param {string|null} utmId - Optional UTM ID to filter by
   * @returns {Promise<string>} CSV string of paid users data
   */
  static async exportPaidUsersToCSV(utmId = null) {
    try {
      let query = supabase
        .from('utm_payment_users')
        .select('*')
        .eq('payment_status', 'success')
        .order('created_at', { ascending: false });

      if (utmId) {
        query = query.eq('utm_id', utmId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return this.convertToCSV(data || []);
    } catch (error) {
      console.error('Error exporting paid users to CSV:', error);
      return null;
    }
  }
}

export default UTMAnalyticsService;

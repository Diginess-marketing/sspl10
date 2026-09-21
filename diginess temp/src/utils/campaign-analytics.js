/**
 * Campaign Analytics Dashboard API
 * 
 * This module provides functions to fetch campaign analytics data
 * from the Supabase player_registrations table for dashboard display.
 * 
 * REFACTORED: Now queries player_registrations directly to handle 'captured' payment status correctly.
 * 
 * Usage:
 * import { getCampaignAnalytics, getCampaignSummary } from './campaign-analytics';
 * 
 * const analytics = await getCampaignAnalytics();
 * const summary = await getCampaignSummary();
 */

import { supabase } from '@/integrations/supabase/client';

const PAID_STATUSES = ['completed', 'captured', 'paid', 'success'];

/**
 * Fetches all campaign analytics data directly from player_registrations and aggregates it
 * @param {Object} options - Optional filters and sorting
 * @returns {Promise<Object>} Campaign analytics data
 */
export async function getCampaignAnalytics(options = {}) {
  try {
    const {
      sortBy = 'total_revenue',  // Sort column
      sortOrder = 'desc',  // 'asc' or 'desc'
      limit = null,  // Limit number of results
      minRevenue = null,  // Filter by minimum revenue
      minConversionRate = null  // Filter by minimum conversion rate
    } = options;

    // Fetch raw data
    const { data: rawData, error } = await supabase
      .from('player_registrations')
      .select('utm_campaign, payment_status, payment_amount, created_at');

    if (error) {
      console.error('Error fetching campaign analytics data:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }

    // Aggregate Data
    const campaignMap = new Map();

    (rawData || []).forEach(row => {
      const campaign = row.utm_campaign || '(not set)';

      if (!campaignMap.has(campaign)) {
        campaignMap.set(campaign, {
          utm_campaign: campaign,
          total_registrations: 0,
          total_paid: 0,
          total_revenue: 0,
          conversion_rate: 0,
          avg_revenue_per_paid_user: 0
        });
      }

      const stats = campaignMap.get(campaign);
      stats.total_registrations++;

      const status = (row.payment_status || '').toLowerCase();
      if (PAID_STATUSES.includes(status)) {
        stats.total_paid++;
        stats.total_revenue += (row.payment_amount || 0);
      }
    });

    let results = Array.from(campaignMap.values());

    // Calculate derived metrics
    results = results.map(c => {
      const conversion_rate = c.total_registrations > 0
        ? Number(((c.total_paid / c.total_registrations) * 100).toFixed(2))
        : 0;

      const avg_revenue_per_paid_user = c.total_paid > 0
        ? Number((c.total_revenue / c.total_paid).toFixed(2))
        : 0;

      return {
        ...c,
        conversion_rate,
        avg_revenue_per_paid_user
      };
    });

    // Apply filters
    if (minRevenue !== null) {
      results = results.filter(c => c.total_revenue >= minRevenue);
    }

    if (minConversionRate !== null) {
      results = results.filter(c => c.conversion_rate >= minConversionRate);
    }

    // Apply sorting
    results.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      // Handle string sorting if needed, but metrics are numbers
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    // Apply limit
    if (limit) {
      results = results.slice(0, limit);
    }

    return {
      success: true,
      data: results,
      count: results.length
    };

  } catch (error) {
    console.error('Unexpected error fetching campaign analytics:', error);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
}

/**
 * Fetches top performing campaigns
 * @param {number} limit - Number of top campaigns to return
 * @returns {Promise<Object>} Top campaigns data
 */
export async function getTopCampaigns(limit = 5) {
  return getCampaignAnalytics({
    sortBy: 'total_revenue',
    sortOrder: 'desc',
    limit
  });
}

/**
 * Fetches campaign summary statistics (totals across all campaigns)
 * @returns {Promise<Object>} Summary statistics
 */
export async function getCampaignSummary() {
  try {
    const { data, error } = await supabase
      .from('player_registrations')
      .select('payment_status, payment_amount');

    if (error) {
      console.error('Error fetching campaign summary:', error);
      return {
        success: false,
        error: error.message
      };
    }

    // Calculate totals
    const summary = {
      total_campaigns: 0, // Not easily countable in single pass without grouping, but we can do distinct campaigns if needed. 
      // However, UI might not strictly need distinct count here or we can skip it.
      // Actually, can fetch count of campaigns via separate query if critical, but let's approximate or just map analytics.
      total_registrations: data.length,
      total_paid: 0,
      total_revenue: 0,
      overall_conversion_rate: 0,
      avg_revenue_per_registration: 0,
      avg_revenue_per_paid_user: 0
    };

    // We can get campaign count by getting distinct campaigns if needed, but let's calculate metrics first
    data.forEach(row => {
      const status = (row.payment_status || '').toLowerCase();
      if (PAID_STATUSES.includes(status)) {
        summary.total_paid++;
        summary.total_revenue += (row.payment_amount || 0);
      }
    });

    // Calculate derived metrics
    if (summary.total_registrations > 0) {
      summary.overall_conversion_rate =
        (summary.total_paid / summary.total_registrations * 100).toFixed(2);
      summary.avg_revenue_per_registration =
        (summary.total_revenue / summary.total_registrations).toFixed(2);
    }

    if (summary.total_paid > 0) {
      summary.avg_revenue_per_paid_user =
        (summary.total_revenue / summary.total_paid).toFixed(2);
    }

    // To get total_campaigns correctly, we can reuse getCampaignAnalytics logic or just ignore if valid
    const { count } = await getCampaignAnalytics();
    summary.total_campaigns = count;

    return {
      success: true,
      data: summary
    };

  } catch (error) {
    console.error('Unexpected error fetching campaign summary:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Fetches analytics for a specific campaign
 * @param {string} campaignName - UTM campaign name
 * @returns {Promise<Object>} Campaign-specific analytics
 */
export async function getCampaignDetails(campaignName) {
  try {
    const { data, error } = await supabase
      .from('player_registrations')
      .select('payment_status, payment_amount, created_at')
      .eq('utm_campaign', campaignName);

    if (error) {
      console.error(`Error fetching campaign '${campaignName}':`, error);
      return {
        success: false,
        error: error.message
      };
    }

    // Aggregate for single campaign
    const stats = {
      utm_campaign: campaignName,
      total_registrations: data.length,
      total_paid: 0,
      total_revenue: 0,
      conversion_rate: 0,
      avg_revenue_per_paid_user: 0
    };

    data.forEach(row => {
      const status = (row.payment_status || '').toLowerCase();
      if (PAID_STATUSES.includes(status)) {
        stats.total_paid++;
        stats.total_revenue += (row.payment_amount || 0);
      }
    });

    if (stats.total_registrations > 0) {
      stats.conversion_rate = Number(((stats.total_paid / stats.total_registrations) * 100).toFixed(2));
    }
    if (stats.total_paid > 0) {
      stats.avg_revenue_per_paid_user = Number((stats.total_revenue / stats.total_paid).toFixed(2));
    }

    return {
      success: true,
      data: stats
    };

  } catch (error) {
    console.error('Unexpected error fetching campaign details:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Fetches time-series data for registrations
 * @param {string} campaignName - Optional campaign filter
 * @param {string} interval - Time interval ('day', 'week', 'month')
 * @returns {Promise<Object>} Time-series data
 */
export async function getRegistrationTimeSeries(campaignName = null, interval = 'day') {
  try {
    let query = supabase
      .from('player_registrations')
      .select('created_at, payment_status, utm_campaign')
      .order('created_at', { ascending: true });

    if (campaignName) {
      query = query.eq('utm_campaign', campaignName);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching time-series data:', error);
      return {
        success: false,
        error: error.message
      };
    }

    // Map 'paid' boolean based on robust status check
    const mappedData = data.map(row => ({
      created_at: row.created_at,
      utm_campaign: row.utm_campaign,
      paid: PAID_STATUSES.includes((row.payment_status || '').toLowerCase())
    }));

    // Group data by time interval
    const groupedData = groupByTimeInterval(mappedData, interval);

    return {
      success: true,
      data: groupedData
    };

  } catch (error) {
    console.error('Unexpected error fetching time-series data:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Helper function to group data by time interval
 * @private
 */
function groupByTimeInterval(data, interval) {
  const grouped = {};

  data.forEach(record => {
    const date = new Date(record.created_at);
    let key;

    switch (interval) {
      case 'day':
        key = date.toISOString().split('T')[0];
        break;
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
        break;
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
      default:
        key = date.toISOString().split('T')[0];
    }

    if (!grouped[key]) {
      grouped[key] = {
        date: key,
        registrations: 0,
        paid: 0
      };
    }

    grouped[key].registrations++;
    if (record.paid) {
      grouped[key].paid++;
    }
  });

  return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * ================================================================
 * UNIFIED GA4 + LOCAL CAMPAIGN ANALYTICS
 * ================================================================
 * Functions to query merged GA4 and local UTM data
 */

/**
 * Fetches unified campaign analytics (GA4 + Local data merged)
 * @param {Object} options - Optional filters and sorting
 * @returns {Promise<Object>} Unified campaign analytics data
 */
export async function getUnifiedCampaignAnalytics(options = {}) {
  try {
    const {
      sortBy = 'local_revenue',
      sortOrder = 'desc',
      limit = null,
      minRevenue = null,
      hasGA4Data = null,  // Filter by GA4 data availability
    } = options;

    let query = supabase
      .from('unified_campaign_analytics')
      .select('*');

    // Apply filters
    if (minRevenue !== null) {
      query = query.gte('local_revenue', minRevenue);
    }

    if (hasGA4Data !== null) {
      query = query.eq('has_ga4_data', hasGA4Data);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply limit
    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching unified analytics:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }

    return {
      success: true,
      data: data || [],
      count: data?.length || 0
    };

  } catch (error) {
    console.error('Unexpected error fetching unified analytics:', error);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
}

/**
 * Fetches GA4 campaign sync data for a specific campaign
 * @param {string} campaignName - UTM campaign name
 * @param {Object} options - Date range and aggregation options
 * @returns {Promise<Object>} GA4 metrics for the campaign
 */
export async function getGA4CampaignMetrics(campaignName, options = {}) {
  try {
    const {
      startDate = null,
      endDate = null,
      aggregateByDate = false,
    } = options;

    let query = supabase
      .from('ga4_campaign_sync')
      .select('*')
      .eq('utm_campaign', campaignName);

    // Apply date filters
    if (startDate) {
      query = query.gte('start_date', startDate);
    }

    if (endDate) {
      query = query.lte('end_date', endDate);
    }

    query = query.order('sync_date', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching GA4 metrics:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }

    // Aggregate if multiple records
    if (data && data.length > 0) {
      if (aggregateByDate) {
        return {
          success: true,
          data: data,
        };
      } else {
        // Aggregate all records into summary
        const aggregated = {
          utm_campaign: campaignName,
          total_sessions: data.reduce((sum, row) => sum + (row.ga4_sessions || 0), 0),
          total_users: data.reduce((sum, row) => sum + (row.ga4_users || 0), 0),
          total_new_users: data.reduce((sum, row) => sum + (row.ga4_new_users || 0), 0),
          total_conversions: data.reduce((sum, row) => sum + (row.ga4_conversions || 0), 0),
          total_revenue: data.reduce((sum, row) => sum + (row.ga4_revenue || 0), 0),
          avg_bounce_rate: data.reduce((sum, row) => sum + (row.ga4_bounce_rate || 0), 0) / data.length,
          avg_session_duration: data.reduce((sum, row) => sum + (row.ga4_avg_session_duration || 0), 0) / data.length,
          records_count: data.length,
          first_sync_date: data[data.length - 1].sync_date,
          last_sync_date: data[0].sync_date,
        };

        return {
          success: true,
          data: aggregated,
        };
      }
    }

    return {
      success: true,
      data: null,
      message: 'No GA4 data available for this campaign'
    };

  } catch (error) {
    console.error('Unexpected error fetching GA4 metrics:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
}

/**
 * Compare local UTM data with GA4 data for discrepancies
 * @returns {Promise<Object>} Comparison report
 */
export async function compareLocalVsGA4Data() {
  try {
    const { data, error } = await supabase
      .from('unified_campaign_analytics')
      .select('*')
      .eq('has_ga4_data', true)
      .eq('has_local_data', true);

    if (error) throw error;

    const comparison = data.map(campaign => ({
      utm_campaign: campaign.utm_campaign,
      local_registrations: campaign.local_registrations,
      ga4_sessions: campaign.ga4_sessions,
      session_to_registration_rate: campaign.session_to_registration_rate,
      local_revenue: campaign.local_revenue,
      ga4_revenue: campaign.ga4_revenue,
      revenue_match_rate: campaign.local_vs_ga4_revenue_match_rate,
      discrepancy: {
        revenue_diff: campaign.local_revenue - campaign.ga4_revenue,
        revenue_diff_percentage: campaign.local_revenue > 0
          ? ((campaign.local_revenue - campaign.ga4_revenue) / campaign.local_revenue * 100).toFixed(2)
          : 0,
      }
    }));

    return {
      success: true,
      data: comparison,
      summary: {
        total_campaigns_compared: comparison.length,
        avg_session_to_registration: (
          comparison.reduce((sum, c) => sum + (c.session_to_registration_rate || 0), 0) / comparison.length
        ).toFixed(2),
        campaigns_with_revenue_discrepancy: comparison.filter(
          c => Math.abs(c.discrepancy.revenue_diff) > 100
        ).length,
      }
    };

  } catch (error) {
    console.error('Unexpected error comparing data:', error);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
}

/**
 * Get GA4 sync status and history
 * @returns {Promise<Object>} Sync status information
 */
export async function getGA4SyncStatus() {
  try {
    // Get latest sync log
    const { data: latestSync, error: syncError } = await supabase
      .from('ga4_sync_log')
      .select('*')
      .order('sync_started_at', { ascending: false })
      .limit(1)
      .single();

    if (syncError && syncError.code !== 'PGRST116') throw syncError;

    // Get sync summary
    const { data: summary, error: summaryError } = await supabase
      .from('ga4_sync_summary')
      .select('*')
      .single();

    if (summaryError && summaryError.code !== 'PGRST116') {
      console.warn('Summary not available:', summaryError);
    }

    return {
      success: true,
      data: {
        latest_sync: latestSync,
        summary: summary,
        is_sync_running: latestSync?.status === 'running',
        last_successful_sync: summary?.last_successful_sync,
      }
    };

  } catch (error) {
    console.error('Error fetching sync status:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
}

/**
 * Get campaign name mappings between GA4 and local
 * @returns {Promise<Object>} Campaign name mappings
 */
export async function getGA4CampaignMappings() {
  try {
    const { data, error } = await supabase
      .from('ga4_campaign_name_mapping')
      .select('*')
      .eq('is_active', true)
      .order('confidence_score', { ascending: false });

    if (error) throw error;

    return {
      success: true,
      data: data || [],
      count: data?.length || 0
    };

  } catch (error) {
    console.error('Error fetching mappings:', error);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
}

/**
 * Create or update campaign name mapping
 * @param {string} ga4Name - GA4 campaign name
 * @param {string} localName - Local UTM campaign name
 * @param {Object} options - Additional mapping options
 * @returns {Promise<Object>} Result of mapping operation
 */
export async function createCampaignMapping(ga4Name, localName, options = {}) {
  try {
    const {
      mappingType = 'manual',
      confidenceScore = 1.0,
      notes = '',
    } = options;

    const { data, error } = await supabase
      .from('ga4_campaign_name_mapping')
      .upsert({
        ga4_campaign_name: ga4Name,
        local_utm_campaign: localName,
        mapping_type: mappingType,
        confidence_score: confidenceScore,
        notes: notes,
        is_active: true,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'ga4_campaign_name'
      })
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data: data,
      message: 'Campaign mapping created successfully'
    };

  } catch (error) {
    console.error('Error creating mapping:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Example React component usage:
 * 
 * import { 
 *   getCampaignAnalytics, 
 *   getCampaignSummary,
 *   getUnifiedCampaignAnalytics,
 *   getGA4CampaignMetrics,
 *   compareLocalVsGA4Data
 * } from '@/utils/campaign-analytics';
 * 
 * function DashboardComponent() {
 *   const [analytics, setAnalytics] = useState([]);
 *   const [unifiedAnalytics, setUnifiedAnalytics] = useState([]);
 *   const [comparison, setComparison] = useState(null);
 * 
 *   useEffect(() => {
 *     async function loadData() {
 *       // Load local analytics
 *       const analyticsResult = await getCampaignAnalytics({ limit: 10 });
 *       
 *       // Load unified GA4 + local analytics
 *       const unifiedResult = await getUnifiedCampaignAnalytics({ limit: 10 });
 *       
 *       // Compare local vs GA4 data
 *       const comparisonResult = await compareLocalVsGA4Data();
 *       
 *       if (analyticsResult.success) {
 *         setAnalytics(analyticsResult.data);
 *       }
 *       
 *       if (unifiedResult.success) {
 *         setUnifiedAnalytics(unifiedResult.data);
 *       }
 *       
 *       if (comparisonResult.success) {
 *         setComparison(comparisonResult.data);
 *       }
 *     }
 *     
 *     loadData();
 *   }, []);
 * 
 *   return (
 *     <div>
 *       <h2>Unified Campaign Analytics (Local + GA4)</h2>
 *       <table>
 *         <thead>
 *           <tr>
 *             <th>Campaign</th>
 *             <th>Local Registrations</th>
 *             <th>GA4 Sessions</th>
 *             <th>Session→Registration %</th>
 *             <th>Local Revenue</th>
 *             <th>GA4 Revenue</th>
 *           </tr>
 *         </thead>
 *         <tbody>
 *           {unifiedAnalytics.map(campaign => (
 *             <tr key={campaign.utm_campaign}>
 *               <td>{campaign.utm_campaign}</td>
 *               <td>{campaign.local_registrations}</td>
 *               <td>{campaign.ga4_sessions}</td>
 *               <td>{campaign.session_to_registration_rate}%</td>
 *               <td>₹{campaign.local_revenue}</td>
 *               <td>₹{campaign.ga4_revenue}</td>
 *             </tr>
 *           ))}
 *         </tbody>
 *       </table>
 *     </div>
 *   );
 * }
 */

export default {
  // Original functions
  getCampaignAnalytics,
  getTopCampaigns,
  getCampaignSummary,
  getCampaignDetails,
  getRegistrationTimeSeries,

  // New GA4 integration functions
  getUnifiedCampaignAnalytics,
  getGA4CampaignMetrics,
  compareLocalVsGA4Data,
  getGA4SyncStatus,
  getGA4CampaignMappings,
  createCampaignMapping,
};

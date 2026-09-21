/**
 * Type definitions for campaign-analytics module
 */

export interface CampaignAnalyticsResult {
  utm_campaign: string;
  total_registrations: number;
  total_paid: number;
  total_revenue: number;
  conversion_rate: number;
  avg_revenue_per_paid_user: number;
  first_registration_date?: string;
  last_registration_date?: string;
}

export interface UnifiedCampaignAnalyticsResult {
  utm_campaign: string;
  local_registrations: number;
  local_paid: number;
  local_revenue: number;
  local_conversion_rate: number;
  local_avg_revenue_per_paid_user: number;
  ga4_sessions: number;
  ga4_users: number;
  ga4_new_users: number;
  ga4_engaged_sessions: number;
  ga4_pageviews: number;
  ga4_avg_bounce_rate: number;
  ga4_avg_session_duration: number;
  ga4_conversions: number;
  ga4_avg_conversion_rate: number;
  ga4_revenue: number;
  ga4_avg_revenue_per_user: number;
  session_to_registration_rate: number | null;
  local_vs_ga4_revenue_match_rate: number | null;
  primary_source: string | null;
  primary_medium: string | null;
  first_local_registration: string | null;
  last_local_registration: string | null;
  first_ga4_data_date: string | null;
  last_ga4_data_date: string | null;
  last_ga4_sync: string | null;
  has_local_data: boolean;
  has_ga4_data: boolean;
}

export interface CampaignSummary {
  total_campaigns: number;
  total_registrations: number;
  total_paid: number;
  total_revenue: number;
  overall_conversion_rate: string;
  avg_revenue_per_registration: string;
  avg_revenue_per_paid_user: string;
}

export interface GA4CampaignMetrics {
  utm_campaign: string;
  total_sessions: number;
  total_users: number;
  total_new_users: number;
  total_conversions: number;
  total_revenue: number;
  avg_bounce_rate: number;
  avg_session_duration: number;
  records_count: number;
  first_sync_date: string;
  last_sync_date: string;
}

export interface ComparisonResult {
  utm_campaign: string;
  local_registrations: number;
  ga4_sessions: number;
  session_to_registration_rate: number | null;
  local_revenue: number;
  ga4_revenue: number;
  revenue_match_rate: number | null;
  discrepancy: {
    revenue_diff: number;
    revenue_diff_percentage: string;
  };
}

export interface ComparisonSummary {
  total_campaigns_compared: number;
  avg_session_to_registration: string;
  campaigns_with_revenue_discrepancy: number;
}

export interface GA4SyncStatus {
  latest_sync: any;
  summary: any;
  is_sync_running: boolean;
  last_successful_sync: string | null;
}

export interface GA4CampaignMapping {
  id: string;
  ga4_campaign_name: string;
  local_utm_campaign: string;
  mapping_type: string;
  confidence_score: number;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  error?: string;
  message?: string;
}

export interface CampaignAnalyticsOptions {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number | null;
  minRevenue?: number | null;
  minConversionRate?: number | null;
}

export interface UnifiedCampaignAnalyticsOptions {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number | null;
  minRevenue?: number | null;
  hasGA4Data?: boolean | null;
}

export interface GA4MetricsOptions {
  startDate?: string | null;
  endDate?: string | null;
  aggregateByDate?: boolean;
}

export interface CampaignMappingOptions {
  mappingType?: string;
  confidenceScore?: number;
  notes?: string;
}

// Function declarations
export function getCampaignAnalytics(
  options?: CampaignAnalyticsOptions
): Promise<ApiResponse<CampaignAnalyticsResult[]>>;

export function getTopCampaigns(
  limit?: number
): Promise<ApiResponse<CampaignAnalyticsResult[]>>;

export function getCampaignSummary(): Promise<ApiResponse<CampaignSummary>>;

export function getCampaignDetails(
  campaignName: string
): Promise<ApiResponse<CampaignAnalyticsResult>>;

export function getRegistrationTimeSeries(
  campaignName?: string | null,
  interval?: 'day' | 'week' | 'month'
): Promise<ApiResponse<any[]>>;

export function getUnifiedCampaignAnalytics(
  options?: UnifiedCampaignAnalyticsOptions
): Promise<ApiResponse<UnifiedCampaignAnalyticsResult[]>>;

export function getGA4CampaignMetrics(
  campaignName: string,
  options?: GA4MetricsOptions
): Promise<ApiResponse<GA4CampaignMetrics | null>>;

export function compareLocalVsGA4Data(): Promise<ApiResponse<ComparisonResult[]> & {
  summary: ComparisonSummary;
}>;

export function getGA4SyncStatus(): Promise<ApiResponse<GA4SyncStatus>>;

export function getGA4CampaignMappings(): Promise<ApiResponse<GA4CampaignMapping[]>>;

export function createCampaignMapping(
  ga4Name: string,
  localName: string,
  options?: CampaignMappingOptions
): Promise<ApiResponse<GA4CampaignMapping>>;

declare const campaignAnalytics: {
  getCampaignAnalytics: typeof getCampaignAnalytics;
  getTopCampaigns: typeof getTopCampaigns;
  getCampaignSummary: typeof getCampaignSummary;
  getCampaignDetails: typeof getCampaignDetails;
  getRegistrationTimeSeries: typeof getRegistrationTimeSeries;
  getUnifiedCampaignAnalytics: typeof getUnifiedCampaignAnalytics;
  getGA4CampaignMetrics: typeof getGA4CampaignMetrics;
  compareLocalVsGA4Data: typeof compareLocalVsGA4Data;
  getGA4SyncStatus: typeof getGA4SyncStatus;
  getGA4CampaignMappings: typeof getGA4CampaignMappings;
  createCampaignMapping: typeof createCampaignMapping;
};

export default campaignAnalytics;

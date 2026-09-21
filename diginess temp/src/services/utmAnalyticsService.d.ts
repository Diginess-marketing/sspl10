import { RealtimeChannel } from '@supabase/supabase-js';

export interface CampaignDetail {
  utm_id: string;
  campaign_name: string;
  source: string;
  medium: string;
}

export interface RegistrationDetail {
  registration_id: string;
  player_name: string;
  player_mobile: string;
  player_email: string;
  player_city: string;
  payment_status: string;
  registration_date: string;
}

export interface PaidUserDetail {
  registration_id: string;
  user_name: string;
  user_email: string;
  user_phone: string;
  user_city: string;
  payment_amount: number;
  payment_timestamp: string;
}

export interface RevenueSummary {
  total_revenue: number;
  total_paid_users: number;
}

export interface FunnelData {
  scans: number;
  registrations: number;
  payments: number;
  scan_to_register: number;
  register_to_pay: number;
}

export interface DetailedAnalytics {
  [key: string]: unknown;
}

declare const UTMAnalyticsService: {
  getCampaignDetails(): Promise<CampaignDetail[]>;
  getDetailedAnalytics(utmId: string): Promise<DetailedAnalytics>;
  getRegistrationDetails(utmId: string): Promise<RegistrationDetail[]>;
  getPaidUsersDetails(utmId: string): Promise<PaidUserDetail[]>;
  getPaidUsersDetailedView(utmId?: string): Promise<PaidUserDetail[]>;
  getRevenueSummary(): Promise<RevenueSummary>;
  getRegistrationFunnel(utmId: string): Promise<FunnelData>;
  exportToCSV(utmId?: string | null): Promise<string | null>;
  exportPaidUsersToCSV(utmId?: string | null): Promise<string | null>;
  subscribeToPaidUsers(callback: (payload: unknown) => void): RealtimeChannel;
};

export default UTMAnalyticsService;

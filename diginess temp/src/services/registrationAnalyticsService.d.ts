/**
 * Type declarations for Registration Analytics Service
 */

import { RealtimeChannel } from '@supabase/supabase-js';

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
  utm_id: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  qr_code_id: string | null;
  qr_title: string | null;
  qr_channel: string | null;
  qr_target_url: string | null;
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

export interface DailyTrend {
  date: string;
  registrations: number;
  revenue: number;
  paid: number;
}

export interface RevenueBySource {
  source: string;
  revenue: number;
  count: number;
}

declare class RegistrationAnalyticsService {
  getRegistrationsWithUTM(filter?: UTMFilter): Promise<RegistrationWithUTM[]>;
  getCampaignPerformance(filter?: DateRangeFilter): Promise<CampaignPerformance[]>;
  getQRCodePerformance(): Promise<QRCodePerformance[]>;
  getAnalyticsSummary(filter?: DateRangeFilter): Promise<AnalyticsSummary>;
  getRegistrationsByCampaign(campaignName: string): Promise<RegistrationWithUTM[]>;
  getRegistrationsByQRCode(qrCodeId: string): Promise<RegistrationWithUTM[]>;
  getPaidUsersWithAttribution(filter?: UTMFilter): Promise<RegistrationWithUTM[]>;
  getRevenueBySource(): Promise<RevenueBySource[]>;
  getDailyTrends(days?: number): Promise<DailyTrend[]>;
  exportToCSV(filter?: UTMFilter): Promise<string>;
  downloadCSV(filter?: UTMFilter, filename?: string): Promise<void>;
}

declare const registrationAnalyticsService: RegistrationAnalyticsService;

export { registrationAnalyticsService };
export default RegistrationAnalyticsService;

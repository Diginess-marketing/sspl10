import { supabase } from '@/integrations/supabase/client';

export interface ScanTrackingData {
  qrCodeId: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  referrer?: string;
  scanSource: string;
}

export class QRAnalyticsService {
  static async trackScan(data: ScanTrackingData): Promise<void> {
    try {
      // Use type assertion to access table not in schema
      await (supabase as any)
        .from('sspl_qr_analytics')
        .insert({
          qr_code_id: data.qrCodeId,
          ip_address: data.ipAddress,
          user_agent: data.userAgent,
          referrer: data.referrer || '',
          scan_source: data.scanSource,
          scanned_at: data.timestamp.toISOString(),
        });
      this.storeScanLocally(data);
    } catch (error) {
    }
  }

  static async getAnalytics(qrCodeId: string): Promise<any> {
    try {
      // Use type assertion to access table not in schema
      const { data, error } = await (supabase as any)
        .from('sspl_qr_analytics')
        .select('*')
        .eq('qr_code_id', qrCodeId)
        .order('scanned_at', { ascending: false });

      if (error) {
        return { analytics: [], summary: {}, trends: [] };
      }

      return {
        analytics: data || [],
        summary: this.calculateSummary(data || []),
        trends: this.calculateTrends(data || []),
      };
    } catch (error) {
      return { analytics: [], summary: {}, trends: [] };
    }
  }

  private static storeScanLocally(data: ScanTrackingData): void {
    try {
      const scans = JSON.parse(localStorage.getItem('qr_scans_pending') || '[]');
      scans.push({ ...data, timestamp: data.timestamp.toISOString() });
      if (scans.length > 1000) scans.splice(0, scans.length - 1000);
      localStorage.setItem('qr_scans_pending', JSON.stringify(scans));
    } catch (error) {
    }
  }

  private static calculateSummary(analytics: any[]): any {
    const uniqueIPs = new Set(analytics.map((a: any) => a.ip_address)).size;
    return { totalScans: analytics.length, uniqueIPs };
  }

  private static calculateTrends(analytics: any[]): any[] {
    const dailyCounts: { [key: string]: number } = {};
    analytics.forEach((record: any) => {
      const date = new Date(record.scanned_at).toISOString().split('T')[0];
      dailyCounts[date] = (dailyCounts[date] || 0) + 1;
    });
    return Object.entries(dailyCounts)
      .map(([date, scans]) => ({ date, scans }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
}

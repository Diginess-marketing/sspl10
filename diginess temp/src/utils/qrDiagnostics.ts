/**
 * QR Code Diagnostic Tool
 * 
 * This file provides utilities for testing QR code functionality
 * Add this to your admin dashboard or create a new admin page with these tests
 * 
 * Usage:
 * - Import QRDiagnostics from '@/utils/qrDiagnostics'
 * - Call QRDiagnostics.runTests() to execute all diagnostics
 * - Check console for results
 */

import { supabase } from '@/integrations/supabase/client';
import { QRCodeService } from '@/services/qrCodeService';
import { QRAnalyticsService } from '@/services/qrAnalyticsService';

export const QRDiagnostics = {
  /**
   * Test 1: Verify database connection
   */
  async testDatabaseConnection() {
    try {
      const { data, error } = await (supabase as any)
        .from('sspl_qr_codes')
        .select('count', { count: 'exact', head: true });

      if (error) {
        return { success: false, error };
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  },

  /**
   * Test 2: Verify Edge Function CORS
   */
  async testEdgeFunctionCORS() {
    try {
      const response = await fetch('/.netlify/functions/manage-qr-codes', {
        method: 'OPTIONS',
        headers: {
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'content-type',
        },
      });

      if (!response.ok) {
        return { success: false, status: response.status };
      }

      const corsHeader = response.headers.get('Access-Control-Allow-Methods');
      if (!corsHeader) {
        return { success: false, error: 'Missing CORS header' };
      }
      return { success: true, corsHeader };
    } catch (err) {
      return { success: false, error: err };
    }
  },

  /**
   * Test 3: Get QR Codes via Edge Function
   */
  async testGetQRCodesViaEdgeFunction() {
    try {
      const result = await QRCodeService.getQRCodes({ page: 1, limit: 5 });

      if (!result || !result.qrCodes) {
        return { success: false, error: 'Invalid response format' };
      }
      return { success: true, count: result.qrCodes.length, total: result.pagination.total };
    } catch (err) {
      return { success: false, error: err };
    }
  },

  /**
   * Test 4: Direct Database Query (Fallback Test)
   */
  async testDirectDatabaseQuery() {
    try {
      const { data, error, count } = await (supabase as any)
        .from('sspl_qr_codes')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        return { success: false, error };
      }
      return { success: true, count: data?.length || 0, total: count };
    } catch (err) {
      return { success: false, error: err };
    }
  },

  /**
   * Test 5: QR Analytics Service
   */
  async testAnalyticsService() {
    try {
      // Get first QR code
      const { data, error } = await (supabase as any)
        .from('sspl_qr_codes')
        .select('id')
        .limit(1)
        .single();

      if (error || !data) {
        return { success: false, error: 'No QR codes available' };
      }

      const qrCodeId = data.id;

      // Try to get analytics
      const analytics = await QRAnalyticsService.getAnalytics(qrCodeId);
      return { success: true, analytics };
    } catch (err) {
      return { success: false, error: err };
    }
  },

  /**
   * Test 6: RLS Policies
   */
  async testRLSPolicies() {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      // Try to query as authenticated user
      const { data, error } = await (supabase as any)
        .from('sspl_qr_codes')
        .select('id, created_by')
        .eq('created_by', user.id)
        .limit(1);

      if (error) {
        return { success: false, error };
      }
      return { success: true, userCodeCount: data?.length || 0 };
    } catch (err) {
      return { success: false, error: err };
    }
  },

  /**
   * Test 7: Channel Relationship
   */
  async testChannelRelationship() {
    try {
      const { data, error } = await (supabase as any)
        .from('sspl_qr_codes')
        .select(`
          id,
          title,
          channel:sspl_qr_channels(
            id,
            name
          )
        `)
        .limit(5);

      if (error) {
        return { success: false, error };
      }

      const withChannels = (data || []).filter((qr: any) => qr.channel);
      return { success: true, codesWithChannels: withChannels.length, total: data?.length || 0 };
    } catch (err) {
      return { success: false, error: err };
    }
  },

  /**
   * Run all diagnostics
   */
  async runTests() {
    const results = {
      databaseConnection: await this.testDatabaseConnection(),
      corsHeaders: await this.testEdgeFunctionCORS(),
      edgeFunction: await this.testGetQRCodesViaEdgeFunction(),
      directQuery: await this.testDirectDatabaseQuery(),
      analytics: await this.testAnalyticsService(),
      rlsPolicies: await this.testRLSPolicies(),
      channels: await this.testChannelRelationship(),
    };

    // Summary
    const passCount = Object.values(results).filter((r: any) => r.success).length;
    const totalCount = Object.values(results).length;
    if (passCount === totalCount) {
    } else {
    }

    return results;
  },
};

/**
 * Export for React component usage
 * 
 * Usage in component:
 * 
 * const handleDiagnostics = async () => {
 *   const results = await QRDiagnostics.runTests();
 *   setDiagnosticResults(results);
 * };
 */
export default QRDiagnostics;

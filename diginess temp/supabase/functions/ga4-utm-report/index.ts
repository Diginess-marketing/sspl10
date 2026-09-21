// @ts-types="https://deno.land/x/types/index.d.ts"

/**
 * Supabase Edge Function: ga4-utm-report
 * 
 * This Edge Function fetches UTM campaign data from Google Analytics 4 Data API
 * 
 * Setup Instructions:
 * 1. Create a service account in Google Cloud Console
 * 2. Enable Google Analytics Data API
 * 3. Add service account email to GA4 property as a Viewer
 * 4. Download service account JSON key
 * 5. Add credentials to Supabase secrets:
 *    supabase secrets set GA4_SERVICE_ACCOUNT_EMAIL="your-sa@project.iam.gserviceaccount.com"
 *    supabase secrets set GA4_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
 *    supabase secrets set GA4_PROPERTY_ID="494303780"
 * 
 * Deploy:
 *    supabase functions deploy ga4-utm-report
 */

// @deno-types="npm:@types/node"
// Use native Deno.serve (no import needed for Deno 1.35+)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

// Declare Deno global for TypeScript
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
  serve: (handler: (req: Request) => Response | Promise<Response>) => void;
}

// Google Analytics Data API endpoint
const GA4_API_BASE = 'https://analyticsdata.googleapis.com/v1beta';

/**
 * Base64 URL encode (without padding)
 */
function base64urlEncode(str: string): string {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  let binary = '';
  const len = data.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(data[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Generate JWT for Google API authentication
 */
async function generateJWT(serviceAccountEmail: string, privateKey: string): Promise<string> {
  const header = {
    alg: 'RS256',
    typ: 'JWT'
  };

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: serviceAccountEmail,
    scope: 'https://www.googleapis.com/auth/analytics.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  };

  // Encode header and payload
  const encodedHeader = base64urlEncode(JSON.stringify(header));
  const encodedPayload = base64urlEncode(JSON.stringify(payload));
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;

  // Sign with private key
  const encoder = new TextEncoder();
  const data = encoder.encode(unsignedToken);

  // Import private key
  const pemHeader = '-----BEGIN PRIVATE KEY-----';
  const pemFooter = '-----END PRIVATE KEY-----';

  // Clean the private key - handle both \n and \\n
  let cleanKey = privateKey.trim();

  // Remove headers
  cleanKey = cleanKey.replace(pemHeader, '').replace(pemFooter, '');

  // Handle escaped newlines from environment variables
  cleanKey = cleanKey.replace(/\\n/g, '');

  // Remove all whitespace including actual newlines
  cleanKey = cleanKey.replace(/\s+/g, '');

  // Decode base64 to binary
  let binaryString: string;
  try {
    binaryString = atob(cleanKey);
  } catch (e) {
    throw new Error(`Failed to decode base64: ${e instanceof Error ? e.message : 'Invalid base64'}`);
  }

  const binaryDer = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    binaryDer[i] = binaryString.charCodeAt(i);
  }

  const key = await crypto.subtle.importKey(
    'pkcs8',
    binaryDer,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256'
    },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, data);

  // Encode signature to base64url
  const signatureArray = new Uint8Array(signature);
  let binarySignature = '';
  for (let i = 0; i < signatureArray.length; i++) {
    binarySignature += String.fromCharCode(signatureArray[i]);
  }
  const encodedSignature = btoa(binarySignature)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  return `${unsignedToken}.${encodedSignature}`;
}

/**
 * Get access token from Google OAuth
 */
async function getAccessToken(serviceAccountEmail: string, privateKey: string): Promise<string> {
  const jwt = await generateJWT(serviceAccountEmail, privateKey);

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    })
  });

  const data = await response.json();
  return data.access_token;
}

/**
 * Fetch UTM report from GA4 with pagination to get ALL data
 */
async function fetchGA4Report(
  propertyId: string,
  accessToken: string,
  startDate: string,
  endDate: string
) {
  const url = `${GA4_API_BASE}/properties/${propertyId}:runReport`;
  const allRows: any[] = [];
  let offset = 0;
  const pageSize = 10000; // Maximum allowed by GA4 API
  let hasMore = true;
  let rowCount = 0;
  let dimensionHeaders: any[] = [];
  let metricHeaders: any[] = [];

  while (hasMore) {
    // Use standard GA4 dimensions for traffic source data
    // These are built-in dimensions that GA4 automatically collects
    const requestBody = {
      dateRanges: [{
        startDate,
        endDate
      }],
      dimensions: [
        { name: 'sessionSource' },           // utm_source equivalent
        { name: 'sessionMedium' },           // utm_medium equivalent  
        { name: 'sessionCampaignName' },     // utm_campaign equivalent
        { name: 'sessionManualAdContent' },  // utm_content equivalent
        { name: 'date' }                     // Include date for better analysis
      ],
      metrics: [
        { name: 'activeUsers' },
        { name: 'sessions' },
        { name: 'conversions' },
        { name: 'totalRevenue' },
        { name: 'newUsers' },
        { name: 'bounceRate' },
        { name: 'averageSessionDuration' },
        { name: 'screenPageViews' }
      ],
      orderBys: [
        {
          dimension: { dimensionName: 'date' },
          desc: true
        },
        {
          metric: { metricName: 'sessions' },
          desc: true
        }
      ],
      limit: pageSize,
      offset: offset
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message || 'GA4 API error');
    }

    // Store headers from first response
    if (offset === 0) {
      dimensionHeaders = data.dimensionHeaders || [];
      metricHeaders = data.metricHeaders || [];
      rowCount = parseInt(data.rowCount || '0');
    }

    // Add rows to collection
    if (data.rows && data.rows.length > 0) {
      allRows.push(...data.rows);
      offset += data.rows.length;

      // Check if we've fetched all rows
      hasMore = offset < rowCount;
    } else {
      hasMore = false;
    }

    // Safety limit to prevent infinite loops (max 100,000 rows)
    if (offset >= 100000) {
      hasMore = false;
    }
  }

  return {
    dimensionHeaders,
    metricHeaders,
    rows: allRows,
    rowCount: allRows.length,
    totalRowCount: rowCount
  };
}

// Modern Deno.serve (native)
Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Max-Age': '86400',
      }
    });
  }

  try {
    // Get request body
    const { startDate = '30daysAgo', endDate = 'today', persistData = true } = await req.json();

    // Get credentials from environment
    const serviceAccountEmail = Deno.env.get('GA4_SERVICE_ACCOUNT_EMAIL');
    const privateKey = Deno.env.get('GA4_PRIVATE_KEY');
    const propertyId = Deno.env.get('GA4_PROPERTY_ID') || '494303780';
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!serviceAccountEmail || !privateKey) {
      throw new Error('GA4 credentials not configured');
    }

    // Get access token
    const accessToken = await getAccessToken(serviceAccountEmail, privateKey);

    // Fetch report
    const report = await fetchGA4Report(propertyId, accessToken, startDate, endDate);

    // Transform response with all available metrics
    const utmReports = (report.rows || []).map((row: any) => ({
      utm_id: 'N/A',
      utm_source: row.dimensionValues[0]?.value || '(not set)',
      utm_medium: row.dimensionValues[1]?.value || '(not set)',
      utm_campaign: row.dimensionValues[2]?.value || '(not set)',
      utm_content: row.dimensionValues[3]?.value || '(not set)',
      date: row.dimensionValues[4]?.value || '',
      users: parseInt(row.metricValues[0]?.value || '0'),
      sessions: parseInt(row.metricValues[1]?.value || '0'),
      conversions: parseInt(row.metricValues[2]?.value || '0'),
      revenue: parseFloat(row.metricValues[3]?.value || '0'),
      newUsers: parseInt(row.metricValues[4]?.value || '0'),
      bounceRate: parseFloat(row.metricValues[5]?.value || '0'),
      avgSessionDuration: parseFloat(row.metricValues[6]?.value || '0'),
      pageViews: parseInt(row.metricValues[7]?.value || '0')
    }));

    // Persist data to Supabase if enabled and credentials are available
    let persistedCount = 0;
    if (persistData && supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Calculate actual date range for storage
        const today = new Date();
        const dateRangeStart = startDate === '30daysAgo'
          ? new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          : startDate;
        const dateRangeEnd = endDate === 'today'
          ? today.toISOString().split('T')[0]
          : endDate;

        // Insert each report row into ga4_analytics table
        for (const row of utmReports) {
          if (row.date) {
            // Convert YYYYMMDD to YYYY-MM-DD
            const formattedDate = `${row.date.substring(0, 4)}-${row.date.substring(4, 6)}-${row.date.substring(6, 8)}`;

            const { error } = await supabase.rpc('upsert_ga4_analytics', {
              p_report_date: formattedDate,
              p_utm_source: row.utm_source === '(not set)' ? null : row.utm_source,
              p_utm_medium: row.utm_medium === '(not set)' ? null : row.utm_medium,
              p_utm_campaign: row.utm_campaign === '(not set)' ? null : row.utm_campaign,
              p_utm_content: row.utm_content === '(not set)' ? null : row.utm_content,
              p_users: row.users,
              p_new_users: row.newUsers,
              p_sessions: row.sessions,
              p_conversions: row.conversions,
              p_revenue: row.revenue,
              p_bounce_rate: row.bounceRate,
              p_avg_session_duration: row.avgSessionDuration,
              p_page_views: row.pageViews,
              p_date_range_start: dateRangeStart,
              p_date_range_end: dateRangeEnd
            });

            if (!error) {
              persistedCount++;
            }
          }
        }
      } catch (persistError) {
        console.error('Error persisting GA4 data:', persistError);
        // Non-fatal error - continue with response
      }
    }

    return new Response(
      JSON.stringify({
        data: utmReports,
        totalRows: report.totalRowCount,
        fetchedRows: report.rowCount,
        persistedRows: persistedCount,
        dateRange: { startDate, endDate }
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
});

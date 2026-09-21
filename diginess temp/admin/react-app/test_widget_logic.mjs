import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fazpykekypcktcmniwbj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhenB5a2VreXBja3RjbW5pd2JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MjQyMzcsImV4cCI6MjA3MTQwMDIzN30.98XobDzYVd8eyUVpnOLNaCgw0l8AnTIR886Eja-Z_hM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testWidgetLogic() {
    const startDate = '2025-01-01';
    const endDate = new Date().toISOString().split('T')[0];
    const dbFilter = 'utm_source.ilike.%karthikeyan%,utm_campaign.ilike.%coimbatore%';

    let query = supabase
        .from('ga4_analytics')
        .select('*')
        .gte('report_date', startDate)
        .lte('report_date', endDate)
        .limit(1000);
        
    query = query.or(dbFilter);
    const { data: dbData, error: dbError } = await query;

    let mappedData = [];
    if (!dbError && dbData && dbData.length > 0) {
        mappedData = dbData.map((row) => ({
            utm_id: 'N/A',
            utm_source: row.utm_source || '(not set)',
            utm_medium: row.utm_medium || '(not set)',
            utm_campaign: row.utm_campaign || '(not set)',
            utm_content: row.utm_content || '(not set)',
            date: row.report_date ? row.report_date.replace(/-/g, '') : '',
            users: row.users || 0,
            sessions: row.sessions || 0,
            conversions: row.conversions || 0,
            revenue: row.revenue || 0,
            newUsers: row.new_users || 0,
            bounceRate: row.bounce_rate || 0,
            avgSessionDuration: row.avg_session_duration || 0,
            pageViews: row.page_views || 0
        }));
    }

    const ga4Data = mappedData;
    const campaignData = ga4Data.filter((d) => 
        (d.utm_source || '').toLowerCase().includes('karthikeyan') ||
        (d.utm_campaign || '').toLowerCase().includes('coimbatore')
    );
    
    let ga4Scans = campaignData.reduce((sum, item) => sum + (item.sessions || 0), 0);
    let ga4Visits = campaignData.reduce((sum, item) => sum + (item.users || 0), 0);
    let ga4Conversions = campaignData.reduce((sum, item) => sum + (item.conversions || 0), 0);
    
    console.log("ga4Scans:", ga4Scans);
    console.log("ga4Visits:", ga4Visits);
    console.log("ga4Conversions:", ga4Conversions);

    // player_registrations
    const { data: regsData, error } = await supabase
        .from('player_registrations')
        .select('full_name, phone, email, city, state, status, payment_status, created_at')
        .or('utm_source.ilike.%karthikeyan%,utm_campaign.ilike.%coimbatore%');

    let totalDBRegistrations = 0;
    let successfulDBRegistrations = 0;
    let failedDBRegistrations = 0;
    
    if (regsData) {
        totalDBRegistrations = regsData.length;
        regsData.forEach((r) => {
        const isSuccessful = r.payment_status === 'captured' || 
                                r.payment_status === 'paid' || 
                                r.payment_status === 'success' ||
                                r.payment_status === 'completed';
        if (isSuccessful) {
            successfulDBRegistrations++;
        } else {
            failedDBRegistrations++;
        }
        });
    }
    
    console.log("totalDBRegistrations:", totalDBRegistrations);
    console.log("successfulDBRegistrations:", successfulDBRegistrations);
    console.log("failedDBRegistrations:", failedDBRegistrations);

    const metrics = {
        scans: ga4Scans > 0 ? ga4Scans : totalDBRegistrations,
        visits: ga4Visits > 0 ? ga4Visits : totalDBRegistrations,
        successfulRegistrations: ga4Conversions > 0 ? ga4Conversions : successfulDBRegistrations,
        failedRegistrations: failedDBRegistrations
    };

    console.log("FINAL METRICS:", metrics);
}

testWidgetLogic();

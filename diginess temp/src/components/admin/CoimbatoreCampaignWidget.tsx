import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ga4DataFetchService } from '@/services/ga4DataFetchService';
import DrillDownModal from './DrillDownModal';

export default function CoimbatoreCampaignWidget() {
  const [metrics, setMetrics] = useState({
    scans: 0,
    visits: 0,
    successfulRegistrations: 0,
    failedRegistrations: 0,
  });
  const [loading, setLoading] = useState(true);
  
  // Store raw database records for the drill-down
  const [rawRegistrations, setRawRegistrations] = useState<any[]>([]);
  
  // Drill-down modal state
  const [drillDown, setDrillDown] = useState<{
    isOpen: boolean;
    title: string;
    players: any[];
  }>({
    isOpen: false,
    title: '',
    players: [],
  });

  const handleCardClick = (type: 'all' | 'successful' | 'failed') => {
    let filtered = rawRegistrations;
    let title = 'All Registrations (Coimbatore Campaign)';
    
    if (type === 'successful') {
      filtered = rawRegistrations.filter((r: any) => 
        r.payment_status === 'captured' || 
        r.payment_status === 'paid' || 
        r.payment_status === 'success' ||
        r.payment_status === 'completed',
      );
      title = 'Successful Registrations (Coimbatore Campaign)';
    } else if (type === 'failed') {
      filtered = rawRegistrations.filter((r: any) => !(
        r.payment_status === 'captured' || 
        r.payment_status === 'paid' || 
        r.payment_status === 'success' ||
        r.payment_status === 'completed'
      ));
      title = 'Failed / Pending Registrations (Coimbatore Campaign)';
    }
    
    // Map to DrillDownModal expected format
    const playersList = filtered.map(p => ({
      name: p.full_name,
      phone: p.phone,
      email: p.email,
      city: p.city,
      state: p.state,
      status: p.status,
      payment_status: p.payment_status,
      date: p.created_at ? new Date(p.created_at).toLocaleDateString() : undefined,
    }));
    
    setDrillDown({
      isOpen: true,
      title,
      players: playersList,
    });
  };

  useEffect(() => {
    let isMounted = true;
    let isInitialLoad = true;

    async function fetchMetrics() {
      try {
        if (isInitialLoad) {
          setLoading(true);
        }

        // 1. Fetch GA4 data for this campaign (if API is working)
        let ga4Scans = 0;
        let ga4Visits = 0;
        try {
          const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          const endDate = new Date().toISOString().split('T')[0];
          const ga4Response = await ga4DataFetchService.getUTMCampaignReport(startDate, endDate);
          const ga4Data = ga4Response?.data || [];
          const campaignData = ga4Data.filter((d: any) => 
            (d.utm_source || '').toLowerCase().includes('karthikeyan') ||
            (d.utm_campaign || '').toLowerCase().includes('coimbatore'),
          );
          
          ga4Scans = campaignData.reduce((sum: number, item: any) => sum + (item.sessions || 0), 0);
          ga4Visits = campaignData.reduce((sum: number, item: any) => sum + (item.users || 0), 0);
        } catch (e) {
          console.error('GA4 fetch error:', e);
        }

        // 2. Fetch Supabase precise tracking data directly from player_registrations
        const { data: regsData, error } = await supabase
          .from('player_registrations')
          .select('full_name, phone, email, city, state, status, payment_status, created_at')
          .ilike('utm_source', '%KARTHIKEYAN%')
          .ilike('utm_campaign', '%coimbatore%');

        if (error) {
          console.error('Supabase fetch error:', error);
        }
        
        let totalDBRegistrations = 0;
        let successfulDBRegistrations = 0;
        let failedDBRegistrations = 0;
        
        if (regsData) {
          if (isMounted) setRawRegistrations(regsData);
          totalDBRegistrations = regsData.length;
          
          regsData.forEach((r: any) => {
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

        if (isMounted) {
          setMetrics({
            // Prefer GA4 metrics for scans/visits since it captures anonymous traffic.
            // Fall back to registration attempts if GA4 returns 0 or fails (e.g. edge function 500 error).
            scans: ga4Scans > 0 ? ga4Scans : totalDBRegistrations,
            visits: ga4Visits > 0 ? ga4Visits : totalDBRegistrations,
            successfulRegistrations: successfulDBRegistrations,
            failedRegistrations: failedDBRegistrations,
          });
          setLoading(false);
          isInitialLoad = false;
        }
      } catch (err) {
        console.error('Error fetching Coimbatore campaign metrics:', err);
        if (isMounted) setLoading(false);
      }
    }

    fetchMetrics();
    
    // Auto-update every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg shadow-sm p-6 border border-purple-100 mb-6">
      <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
        <span>📍</span> Coimbatore Campaign (Mr. Karthikeyan)
      </h2>
      
      {loading ? (
        <div className="flex animate-pulse space-x-4">
          <div className="h-16 bg-purple-200 rounded-lg w-1/4"></div>
          <div className="h-16 bg-purple-200 rounded-lg w-1/4"></div>
          <div className="h-16 bg-purple-200 rounded-lg w-1/4"></div>
          <div className="h-16 bg-purple-200 rounded-lg w-1/4"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div 
            onClick={() => handleCardClick('all')}
            className="bg-white rounded-lg shadow-sm p-4 border border-purple-50 cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Number of Scans</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{metrics.scans}</p>
              </div>
              <div className="text-3xl">📱</div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Total Sessions via QR Scan</p>
          </div>
          
          <div 
            onClick={() => handleCardClick('all')}
            className="bg-white rounded-lg shadow-sm p-4 border border-purple-50 cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Website Visits</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{metrics.visits}</p>
              </div>
              <div className="text-3xl">🌐</div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Unique Visitors</p>
          </div>
          
          <div 
            onClick={() => handleCardClick('successful')}
            className="bg-white rounded-lg shadow-sm p-4 border border-purple-50 cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Successful</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{metrics.successfulRegistrations}</p>
              </div>
              <div className="text-3xl">✅</div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Paid Registrations</p>
          </div>

          <div 
            onClick={() => handleCardClick('failed')}
            className="bg-white rounded-lg shadow-sm p-4 border border-purple-50 cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600 text-sm font-medium">Failed / Pending</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{metrics.failedRegistrations}</p>
              </div>
              <div className="text-3xl">❌</div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Dropped off or failed pay</p>
          </div>
        </div>
      )}

      <DrillDownModal
        isOpen={drillDown.isOpen}
        onClose={() => setDrillDown(prev => ({ ...prev, isOpen: false }))}
        title={drillDown.title}
        players={drillDown.players}
        loading={false}
      />
    </div>
  );
}

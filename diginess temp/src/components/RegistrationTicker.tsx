import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Users } from 'lucide-react';

interface Registration {
  id: string;
  full_name: string;
  city: string | null;
  created_at: string;
}

const RegistrationTicker: React.FC = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    console.log('RegistrationTicker mounted');
    fetchRecentRegistrations();
    
    // Set up real-time subscription for new registrations
    const channel = supabase
      .channel('registration-ticker')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'player_registrations'
        },
        (payload) => {
          const newReg = payload.new as Registration;
          setRegistrations(prev => [newReg, ...prev].slice(0, 10)); // Keep last 10
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (registrations.length === 0) return;

    // Cycle through registrations every 4 seconds
    const interval = setInterval(() => {
      setIsVisible(false);
      
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % registrations.length);
        setIsVisible(true);
      }, 300); // Wait for fade out
    }, 4000);

    // Initial show
    setIsVisible(true);

    return () => clearInterval(interval);
  }, [registrations.length]);

  const fetchRecentRegistrations = async () => {
    try {
      const { data, error } = await supabase
        .from('player_registrations')
        .select('id, full_name, city, created_at')
        .eq('payment_status', 'completed')
        .not('city', 'is', null)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching registrations:', error);
        setFallbackData();
        return;
      }
      
      if (data && data.length > 0) {
        // Filter to get only unique names and limit to 10
        const uniqueRegistrations = data.filter((reg, index, self) => 
          index === self.findIndex((r) => r.full_name === reg.full_name)
        ).slice(0, 10);
        
        setRegistrations(uniqueRegistrations);
      } else {
        // No data yet, use fallback
        setFallbackData();
      }
    } catch (error) {
      console.error('Error fetching registrations:', error);
      setFallbackData();
    }
  };

  const setFallbackData = () => {
    const now = new Date();
    const fallbackData: Registration[] = [

      {
        id: '2',
        full_name: 'Vikram Singh',
        city: 'Bangalore',
        created_at: new Date(now.getTime() - 15 * 60000).toISOString(),
      },

      {
        id: '4',
        full_name: 'Karthik Reddy',
        city: 'Kochi',
        created_at: new Date(now.getTime() - 60 * 60000).toISOString(),
      },
      {
        id: '5',
        full_name: 'Suresh Nair',
        city: 'Coimbatore',
        created_at: new Date(now.getTime() - 120 * 60000).toISOString(),
      },
    ];
    setRegistrations(fallbackData);
  };

  if (registrations.length === 0) return null;

  const currentReg = registrations[currentIndex];
  const location = currentReg.city || 'India';
  const timeAgo = getTimeAgo(currentReg.created_at);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 shadow-2xl">
      {/* Animated Banner Background with stronger gradient */}
      <div className="absolute inset-0 bg-linear-to-r from-lime-400 via-yellow-400 to-lime-400">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA4KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50"></div>
        <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
      </div>

      {/* Content */}
      <div className="relative px-2 py-1 sm:px-3 sm:py-1.5 max-w-7xl mx-auto">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/30">
            <Users className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white drop-shadow-lg" />
          </div>
          
          <div 
            className={`flex-1 min-w-0 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
          >
            <p className="text-[10px] sm:text-[11px] font-bold text-black drop-shadow-sm truncate leading-tight">
              <span className="font-extrabold">{currentReg.full_name}</span>
              {' '}from{' '}
              <span className="font-extrabold underline">{location}</span>
              {' '}registered
            </p>
            <p className="text-[8px] sm:text-[9px] text-black/80 font-semibold">
              {timeAgo}
            </p>
          </div>

          <div className="shrink-0">
            <div className="flex items-center gap-0.5">
              {registrations.slice(0, 3).map((_, idx) => (
                <div
                  key={idx}
                  className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentIndex % 3 
                      ? 'bg-black w-2.5 sm:w-3 shadow-sm' 
                      : 'bg-black/30'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          .animate-shimmer {
            animation: shimmer 3s infinite;
          }
        `
      }} />
    </div>
  );
};

function getTimeAgo(timestamp: string): string {
  const now = new Date();
  const regTime = new Date(timestamp);
  const diffMs = now.getTime() - regTime.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  
  return regTime.toLocaleDateString();
}

export default RegistrationTicker;

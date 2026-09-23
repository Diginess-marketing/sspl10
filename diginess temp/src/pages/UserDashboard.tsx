import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { usePlayerResultLookup } from '@/hooks/usePlayerResultLookup';
import PlayerResultCard from '@/components/player-lookup/PlayerResultCard';
import { Loader2, Copy, Gift } from 'lucide-react';

const UserDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getPlayerByMobile, isLoading: playerLoading, error: playerError, results } = usePlayerResultLookup();

  const [mobileInput, setMobileInput] = useState('');
  const [isLinking, setIsLinking] = useState(false);
  const [linkedMobile, setLinkedMobile] = useState<string | null>(null);

  const [referralData, setReferralData] = useState<{ referral_code: string; reward_points: number } | null>(null);
  const [loadingReferral, setLoadingReferral] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth', { replace: true });
    } else if (user) {
      const mobile = user.user_metadata?.linked_mobile;
      if (mobile) {
        setLinkedMobile(mobile);
        getPlayerByMobile(mobile);
      }

      const fetchReferral = async () => {
        setLoadingReferral(true);
        try {
          const { data, error } = await supabase
            .from('user_profiles' as any)
            .select('referral_code, reward_points')
            .eq('id', user.id)
            .single();
            
          if (!error && data) {
            setReferralData(data as any);
          } else if (error) {
            console.error('fetchReferral error:', error);
          }
        } catch (err) {
          console.error('fetchReferral exception:', err);
        } finally {
          setLoadingReferral(false);
        }
      };
      fetchReferral();
    }
  }, [user, authLoading, navigate, getPlayerByMobile]);

  const handleLinkMobile = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanMobile = mobileInput.trim().replace(/\D/g, '').slice(-10);
    
    if (cleanMobile.length !== 10) {
      toast({
        title: 'Invalid Input',
        description: 'Please enter a valid 10-digit mobile number.',
        variant: 'destructive',
      });
      return;
    }

    setIsLinking(true);
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: { linked_mobile: cleanMobile },
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Mobile number linked successfully.',
      });
      
      setLinkedMobile(cleanMobile);
      getPlayerByMobile(cleanMobile);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to link mobile number.',
        variant: 'destructive',
      });
    } finally {
      setIsLinking(false);
    }
  };

  if (authLoading || (linkedMobile && playerLoading && results.length === 0)) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-cricket-blue" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-cricket-blue">User Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user?.email}</p>
          </div>
        </div>

        {/* Refer and Earn Card */}
        {referralData && (
          <Card className="mb-8 border-2 border-sspl-orange overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-sspl-orange/10 rounded-full blur-xl -mr-10 -mt-10 pointer-events-none"></div>
            <CardHeader className="bg-gradient-to-r from-white to-orange-50 border-b">
              <CardTitle className="flex items-center gap-2 text-sspl-orange">
                <Gift className="w-6 h-6" />
                Refer & Earn
              </CardTitle>
              <CardDescription>
                Invite friends and earn points to redeem exclusive SSPL Merchandise (Coming Soon!)
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                <div className="bg-gray-50 p-4 rounded-lg border text-center w-full md:w-1/2">
                  <p className="text-sm text-gray-500 mb-1">Your Referral Code</p>
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-2xl font-black tracking-widest text-sspl-navy">{referralData.referral_code}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => {
                        navigator.clipboard.writeText(referralData.referral_code);
                        toast({ title: 'Copied!', description: 'Referral code copied to clipboard.' });
                      }}
                    >
                      <Copy className="w-4 h-4 text-gray-500" />
                    </Button>
                  </div>
                </div>
                
                <div className="bg-sspl-navy text-white p-4 rounded-lg text-center w-full md:w-1/2 relative overflow-hidden">
                  <p className="text-sm text-blue-200 mb-1">Reward Points</p>
                  <p className="text-4xl font-black text-sspl-orange">{referralData.reward_points}</p>
                  <p className="text-xs text-blue-200 mt-2">Earn 50 points per referral!</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {!linkedMobile ? (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Link Your Player Profile</CardTitle>
              <CardDescription>
                Please enter the mobile number you used during SSPL registration to view your selection status and player profile.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLinkMobile} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={mobileInput}
                    onChange={(e) => setMobileInput(e.target.value)}
                    required
                    maxLength={10}
                    pattern="[0-9]{10}"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-cricket-blue hover:bg-cricket-dark-blue"
                  disabled={isLinking}
                >
                  {isLinking ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {isLinking ? 'Linking...' : 'Link Profile'}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-lg shadow-sm border border-gray-100 gap-4">
              <div>
                <span className="text-sm text-gray-500">Linked Mobile:</span>
                <span className="ml-2 font-medium">{linkedMobile}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={async () => {
                  try {
                    await supabase.auth.updateUser({
                      data: { linked_mobile: null },
                    });
                    setLinkedMobile(null);
                    setMobileInput('');
                  } catch (error) {
                    console.error('Error unlinking mobile:', error);
                  }
                }}
              >
                Change Number
              </Button>
            </div>

            {playerError ? (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6 text-center text-red-600">
                  <p>{playerError}</p>
                  <p className="text-sm mt-2">If you registered recently, please wait for the results to be published.</p>
                </CardContent>
              </Card>
            ) : results.length > 0 ? (
              <PlayerResultCard player={results[0]} />
            ) : (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  <p>No player profile found for this mobile number.</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;

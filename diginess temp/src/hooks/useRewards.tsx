/**
 * useRewards Hook
 * Manages user rewards, points, coupons, and redemptions
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

// Helper function to safely get error message
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return String(error);
};

export const useRewards = () => {
  const { user, session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rewards, setRewards] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [history, setHistory] = useState([]);
  const [tier, setTier] = useState(null);
  const [achievements, setAchievements] = useState([]);

  const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3002';

  const getAuthHeaders = useCallback((): Record<string, string> => {
    if (!session?.access_token) return {};
    return {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    };
  }, [session]);

  /**
   * Fetch user's current points and rewards
   */
  const fetchUserPoints = useCallback(async () => {
    if (!user?.id || !session) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/rewards/user-points`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error('Failed to fetch points');

      const data = await response.json();
      setRewards(data);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [user?.id, session, getAuthHeaders, API_BASE]);

  /**
   * Claim download/installation bonus
   */
  const claimDownloadBonus = useCallback(async () => {
    if (!user?.id || !session) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/rewards/claim-download-bonus`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to claim bonus');
      }

      const data = await response.json();
      await fetchUserPoints(); // Refresh points
      setError(null);
      return data;
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.id, session, getAuthHeaders, API_BASE, fetchUserPoints]);

  /**
   * Fetch available coupons
   */
  const fetchAvailableCoupons = useCallback(async () => {
    if (!user?.id || !session) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/rewards/available-coupons`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error('Failed to fetch coupons');

      const data = await response.json();
      setCoupons(data.coupons || []);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [user?.id, session, getAuthHeaders, API_BASE]);

  /**
   * Redeem a coupon code
   */
  const redeemCoupon = useCallback(async (couponCode: string, amount: string) => {
    if (!user?.id || !session) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/rewards/redeem-coupon`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          coupon_code: couponCode,
          amount: parseFloat(amount),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to redeem coupon');
      }

      const data = await response.json();
      await fetchUserPoints(); // Refresh points
      await fetchRedemptionHistory(); // Refresh history
      setError(null);
      return data;
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.id, session, getAuthHeaders, API_BASE, fetchUserPoints]);

  /**
   * Fetch redemption history
   */
  const fetchRedemptionHistory = useCallback(async (limit = 20) => {
    if (!user?.id || !session) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/rewards/redemption-history?limit=${limit}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error('Failed to fetch history');

      const data = await response.json();
      setHistory(data.history || []);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [user?.id, session, getAuthHeaders, API_BASE]);

  /**
   * Fetch user's reward tier
   */
  const fetchUserTier = useCallback(async () => {
    if (!user?.id || !session) return;

    try {
      const response = await fetch(`${API_BASE}/api/rewards/user-tier`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error('Failed to fetch tier');

      const data = await response.json();
      setTier(data.tier);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, [user?.id, session, getAuthHeaders, API_BASE]);

  /**
   * Fetch user's achievements
   */
  const fetchAchievements = useCallback(async () => {
    if (!user?.id || !session) return;

    try {
      const response = await fetch(`${API_BASE}/api/rewards/achievements`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error('Failed to fetch achievements');

      const data = await response.json();
      setAchievements(data.achievements || []);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, [user?.id, session, getAuthHeaders, API_BASE]);

  /**
   * Generate referral code
   */
  const generateReferralCode = useCallback(async () => {
    if (!user?.id || !session) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/rewards/referral/generate`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error('Failed to generate referral code');

      const data = await response.json();
      setError(null);
      return data;
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.id, session, getAuthHeaders, API_BASE]);

  /**
   * Claim referral reward
   */
  const claimReferralReward = useCallback(async (referralCode: string) => {
    if (!user?.id || !session) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/rewards/referral/claim`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ referral_code: referralCode }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to claim referral reward');
      }

      const data = await response.json();
      await fetchUserPoints(); // Refresh points
      setError(null);
      return data;
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.id, session, getAuthHeaders, API_BASE, fetchUserPoints]);

  // Fetch data on mount or when user/session changes
  useEffect(() => {
    if (user?.id && session) {
      fetchUserPoints();
      fetchUserTier();
      fetchAchievements();
    }
  }, [user?.id, session]);

  return {
    // State
    rewards,
    coupons,
    history,
    tier,
    achievements,
    loading,
    error,

    // Methods
    fetchUserPoints,
    claimDownloadBonus,
    fetchAvailableCoupons,
    redeemCoupon,
    fetchRedemptionHistory,
    fetchUserTier,
    fetchAchievements,
    generateReferralCode,
    claimReferralReward,
  };
};

/**
 * Rewards Dashboard Component
 * Displays user rewards, points, coupons, and tier information
 */

import React, { useState, useEffect } from 'react';
import { useRewards } from '../hooks/useRewards';
import { AlertCircle, Award, Gift, Zap, Share2, Copy, Check } from 'lucide-react';

// Types
interface RewardsData {
  total_points: number;
  total_coupons_claimed: number;
  app_download_bonus_claimed: boolean;
}

interface TierData {
  rewards_tiers?: {
    tier_name: string;
    reward_multiplier?: number;
  };
}

interface Achievement {
  id: string;
  icon_url?: string;
  achievement_name: string;
  reward_points: number;
}

interface Coupon {
  id: string;
  coupon_code: string;
  discount_percentage?: number | null;
  discount_amount?: number | null;
  points_cost: number;
  minimum_amount?: number | null;
  current_uses?: number;
  max_uses: number;
}

interface HistoryEntry {
  id: string;
  rewards_coupons?: Coupon;
  points_used?: number;
  discount_received?: number;
  redemption_date?: string | null;
}

export const RewardsDashboard: React.FC = () => {
  const {
    rewards: rewardsData,
    coupons: couponsData,
    history: historyData,
    tier: tierData,
    achievements: achievementsData,
    loading,
    error,
    claimDownloadBonus,
    fetchAvailableCoupons,
    redeemCoupon,
    generateReferralCode,
  } = useRewards();

  // Cast data to proper types
  const rewards = rewardsData as RewardsData | null;
  const coupons = couponsData as Coupon[];
  const history = historyData as HistoryEntry[];
  const tier = tierData as TierData | null;
  const achievements = achievementsData as Achievement[];

  const [activeTab, setActiveTab] = useState('overview');
  const [redeeming, setRedeeming] = useState(false);
  const [redeemError, setRedeemError] = useState('');
  const [redeemSuccess, setRedeemSuccess] = useState('');
  const [selectedCoupon, setSelectedCoupon] = useState('');
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [copied, setCopied] = useState(false);
  const [referralCode, setReferralCode] = useState('');

  useEffect(() => {
    fetchAvailableCoupons();
  }, []);

  const handleClaimBonus = async () => {
    try {
      setRedeemError('');
      await claimDownloadBonus();
      setRedeemSuccess('Download bonus claimed successfully!');
      setTimeout(() => setRedeemSuccess(''), 3000);
    } catch (err) {
      setRedeemError((err as Error).message);
    }
  };

  const handleRedeemCoupon = async () => {
    if (!selectedCoupon || !purchaseAmount) {
      setRedeemError('Please select a coupon and enter purchase amount');
      return;
    }

    setRedeeming(true);
    setRedeemError('');
    setRedeemSuccess('');

    try {
      const result = await redeemCoupon(selectedCoupon, purchaseAmount);
      setRedeemSuccess(
        `Coupon redeemed! Discount: ₹${result.discount_amount?.toFixed(2)}`,
      );
      setSelectedCoupon('');
      setPurchaseAmount('');
      setTimeout(() => setRedeemSuccess(''), 3000);
    } catch (err) {
      setRedeemError((err as Error).message);
    } finally {
      setRedeeming(false);
    }
  };

  const handleGenerateReferral = async () => {
    try {
      const result = await generateReferralCode();
      setReferralCode(result.referral_code);
    } catch (err) {
      setRedeemError((err as Error).message);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading && !rewards) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Rewards & Points</h1>
        <p className="text-gray-600">Earn points and redeem amazing rewards</p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {redeemError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-700">{redeemError}</span>
        </div>
      )}

      {redeemSuccess && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <Check className="w-5 h-5 text-green-600" />
          <span className="text-green-700">{redeemSuccess}</span>
        </div>
      )}

      {/* Points Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-linear-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm mb-1">Total Points</p>
              <p className="text-4xl font-bold">{rewards?.total_points || 0}</p>
            </div>
            <Zap className="w-12 h-12 opacity-20" />
          </div>
        </div>

        <div className="bg-linear-to-br from-purple-500 to-purple-600 text-white rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm mb-1">Coupons Claimed</p>
              <p className="text-4xl font-bold">{rewards?.total_coupons_claimed || 0}</p>
            </div>
            <Gift className="w-12 h-12 opacity-20" />
          </div>
        </div>

        <div className="bg-linear-to-br from-amber-500 to-amber-600 text-white rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm mb-1">Your Tier</p>
              <p className="text-2xl font-bold">{tier?.rewards_tiers?.tier_name || 'Member'}</p>
            </div>
            <Award className="w-12 h-12 opacity-20" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b">
        {['overview', 'coupons', 'history', 'referral'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === tab
                ? 'text-primary border-b-2 border-primary -mb-1'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg border p-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {!rewards?.app_download_bonus_claimed && (
              <div className="bg-linear-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Claim Your Download Bonus
                    </h3>
                    <p className="text-gray-600">
                      Get 500 bonus points just for downloading and installing the app!
                    </p>
                  </div>
                  <button
                    onClick={handleClaimBonus}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium whitespace-nowrap ml-4"
                  >
                    Claim Now
                  </button>
                </div>
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold mb-4">How to Earn Points</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: 'Download App', points: '500', icon: '📱' },
                  { title: 'Register Account', points: '100', icon: '👤' },
                  { title: 'Refer Friends', points: '500+', icon: '👥' },
                  { title: 'Tournament Entry', points: '50-200', icon: '🏆' },
                  { title: 'Make a Purchase', points: '1-5%', icon: '💳' },
                  { title: 'Leave a Review', points: '50', icon: '⭐' },
                ].map((item) => (
                  <div key={item.title} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <p className="font-medium text-gray-900">{item.title}</p>
                        <p className="text-sm text-primary font-semibold">+{item.points} pts</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {achievements && achievements.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Achievements</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {achievements.map((achievement) => (
                    <div key={achievement.id} className="text-center p-4 bg-gray-50 rounded-lg">
                      {achievement.icon_url && (
                        <img
                          src={achievement.icon_url}
                          alt={achievement.achievement_name}
                          className="w-12 h-12 mx-auto mb-2"
                        />
                      )}
                      <p className="font-medium text-sm text-gray-900 mb-1">
                        {achievement.achievement_name}
                      </p>
                      <p className="text-xs text-primary">+{achievement.reward_points} pts</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Coupons Tab */}
        {activeTab === 'coupons' && (
          <div className="space-y-6">
            {coupons && coupons.length > 0 ? (
              <>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Available Coupons</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {coupons.map((coupon) => (
                      <div
                        key={coupon.id}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                          selectedCoupon === coupon.coupon_code
                            ? 'border-primary bg-blue-50'
                            : 'border-gray-200 hover:border-primary'
                        }`}
                        onClick={() => setSelectedCoupon(coupon.coupon_code)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-bold text-lg text-gray-900">
                            {coupon.discount_percentage
                              ? `${coupon.discount_percentage}%`
                              : `₹${coupon.discount_amount}`}{' '}
                            OFF
                          </p>
                          <span className="text-xs bg-primary text-white px-2 py-1 rounded">
                            {coupon.points_cost} pts
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{coupon.coupon_code}</p>
                        {coupon.minimum_amount && coupon.minimum_amount > 0 && (
                          <p className="text-xs text-gray-500">
                            Min. amount: ₹{coupon.minimum_amount}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          Uses: {coupon.current_uses}/{coupon.max_uses}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-semibold mb-4">Redeem Coupon</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Selected Coupon
                      </label>
                      <input
                        type="text"
                        value={selectedCoupon}
                        readOnly
                        placeholder="Select a coupon above"
                        className="w-full px-4 py-2 border rounded-lg bg-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Purchase Amount (₹)
                      </label>
                      <input
                        type="number"
                        value={purchaseAmount}
                        onChange={(e) => setPurchaseAmount(e.target.value)}
                        placeholder="Enter amount"
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                    </div>

                    <button
                      onClick={handleRedeemCoupon}
                      disabled={redeeming || !selectedCoupon || !purchaseAmount}
                      className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:bg-gray-400 transition-colors"
                    >
                      {redeeming ? 'Redeeming...' : 'Redeem Coupon'}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-center text-gray-600 py-8">
                No coupons available right now. Check back soon!
              </p>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            {history && history.length > 0 ? (
              history.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      Coupon: {item.rewards_coupons?.coupon_code}
                    </p>
                    <p className="text-sm text-gray-600">
                      Points Used: {item.points_used}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">
                      ₹{item.discount_received?.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-600">
                      {item.redemption_date ? new Date(item.redemption_date).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-600 py-8">
                No redemption history yet
              </p>
            )}
          </div>
        )}

        {/* Referral Tab */}
        {activeTab === 'referral' && (
          <div className="space-y-6">
            {!referralCode ? (
              <button
                onClick={handleGenerateReferral}
                className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                <Share2 className="w-5 h-5" />
                Generate Your Referral Code
              </button>
            ) : (
              <div className="bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                <p className="text-sm text-gray-600 mb-3">Your Referral Code</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-4 py-2 bg-white border rounded-lg font-mono text-lg font-bold">
                    {referralCode}
                  </code>
                  <button
                    onClick={() => copyToClipboard(referralCode)}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">How Referrals Work</h3>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex gap-3">
                  <span className="text-primary font-bold">1.</span>
                  <span>Share your referral code with friends</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">2.</span>
                  <span>They sign up using your code</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">3.</span>
                  <span>You earn 500 points per successful referral</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">4.</span>
                  <span>Your friend gets 200 bonus points</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

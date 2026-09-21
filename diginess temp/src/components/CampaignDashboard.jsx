/**
 * Example React Dashboard Component for Campaign Analytics
 * 
 * This component demonstrates how to use the campaign-analytics API
 * to display UTM campaign performance in a dashboard.
 * 
 * Features:
 * - Summary statistics cards
 * - Campaign performance table
 * - Top campaigns chart
 * - Time-series registration trends
 */

import React, { useState, useEffect } from 'react';
import {
  getCampaignAnalytics,
  getCampaignSummary,
  getTopCampaigns
} from '@/utils/campaign-analytics';

const CampaignDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [topCampaigns, setTopCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [summaryResult, campaignsResult, topResult] = await Promise.all([
        getCampaignSummary(),
        getCampaignAnalytics({ limit: 20 }),
        getTopCampaigns(5)
      ]);

      if (summaryResult.success) {
        setSummary(summaryResult.data);
      }

      if (campaignsResult.success) {
        setCampaigns(campaignsResult.data);
      }

      if (topResult.success) {
        setTopCampaigns(topResult.data);
      }

      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        Campaign Analytics Dashboard
      </h1>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <SummaryCard
            title="Total Campaigns"
            value={summary.total_campaigns}
            icon="📊"
          />
          <SummaryCard
            title="Total Registrations"
            value={summary.total_registrations}
            icon="👥"
          />
          <SummaryCard
            title="Paid Users"
            value={summary.total_paid}
            subtitle={`${summary.overall_conversion_rate}% conversion`}
            icon="✅"
          />
          <SummaryCard
            title="Total Revenue"
            value={formatCurrency(summary.total_revenue)}
            subtitle={`Avg: ${formatCurrency(summary.avg_revenue_per_paid_user)} per user`}
            icon="💰"
          />
        </div>
      )}

      {/* Top Campaigns */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Top 5 Campaigns by Revenue
        </h2>
        <div className="space-y-4">
          {topCampaigns.map((campaign, index) => (
            <div
              key={campaign.utm_campaign}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className="text-2xl font-bold text-gray-400">
                  #{index + 1}
                </div>
                <div>
                  <div className="font-semibold text-gray-800">
                    {campaign.utm_campaign}
                  </div>
                  <div className="text-sm text-gray-600">
                    {campaign.total_registrations} registrations • {campaign.conversion_rate}% conversion
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-green-600">
                  {formatCurrency(campaign.total_revenue)}
                </div>
                <div className="text-sm text-gray-600">
                  {campaign.total_paid} paid
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All Campaigns Table */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          All Campaigns
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Campaign
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registrations
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paid
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conversion
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg/User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Range
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {campaigns.map((campaign) => (
                <tr key={campaign.utm_campaign} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">
                      {campaign.utm_campaign}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {campaign.total_registrations}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {campaign.total_paid}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      campaign.conversion_rate >= 50
                        ? 'bg-green-100 text-green-800'
                        : campaign.conversion_rate >= 25
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {campaign.conversion_rate}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {formatCurrency(campaign.total_revenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatCurrency(campaign.avg_revenue_per_paid_user)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <div>{formatDate(campaign.first_registration_date)}</div>
                    <div className="text-xs text-gray-400">
                      to {formatDate(campaign.last_registration_date)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="mt-8 text-center">
        <button
          onClick={loadDashboardData}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          🔄 Refresh Data
        </button>
      </div>
    </div>
  );
};

/**
 * Summary Card Component
 */
const SummaryCard = ({ title, value, subtitle, icon }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium text-gray-600">{title}</div>
        <div className="text-2xl">{icon}</div>
      </div>
      <div className="text-3xl font-bold text-gray-800 mb-1">{value}</div>
      {subtitle && (
        <div className="text-sm text-gray-600">{subtitle}</div>
      )}
    </div>
  );
};

export default CampaignDashboard;

import React, { useEffect, useState } from 'react';
import {
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  ChartBarIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { useApp } from '../../context/AppContext';
import LoadingSpinner from '../UI/LoadingSpinner';
import CostChart from './CostChart';
import ServiceBreakdown from './ServiceBreakdown';
import RecommendationsList from './RecommendationsList';
import MetricCard from './MetricCard';

const Dashboard: React.FC = () => {
  const { state, refreshDashboard } = useApp();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshDashboard();
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  if (state.isLoading && !state.dashboardData) {
    return (
      <div className="lg:pl-64 min-h-screen bg-gray-50">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <LoadingSpinner size="large" />
            <p className="mt-4 text-lg text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="lg:pl-64 min-h-screen bg-gray-50">
        <div className="flex items-center justify-center h-full">
          <div className="text-center max-w-md">
            <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
            <h2 className="mt-2 text-lg font-semibold text-gray-900">Error Loading Dashboard</h2>
            <p className="mt-1 text-gray-600">{state.error}</p>
            <button
              onClick={handleRefresh}
              className="mt-4 btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { dashboardData } = state;

  if (!dashboardData) {
    return null;
  }

  return (
    <div className="lg:pl-64 min-h-screen bg-gray-50">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Cost Optimization Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                {state.awsConnected 
                  ? 'Real-time AWS cost analysis and optimization recommendations'
                  : 'Demo dashboard showing sample AWS cost optimization insights'
                }
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="btn-primary flex items-center"
            >
                                <ArrowPathIcon 
                className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} 
              />
              {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <MetricCard
            title="Total Monthly Cost"
            value={formatCurrency(dashboardData.totalCost)}
            change={dashboardData.monthlyChange}
            changeLabel="vs last month"
            icon={CurrencyDollarIcon}
            color="blue"
          />
          <MetricCard
            title="Savings Opportunity"
            value={formatCurrency(dashboardData.savingsOpportunity)}
            change={null}
            changeLabel="potential monthly savings"
            icon={LightBulbIcon}
            color="green"
          />
          <MetricCard
            title="Active Recommendations"
            value={dashboardData.recommendations.length.toString()}
            change={null}
            changeLabel="optimization suggestions"
            icon={ChartBarIcon}
            color="purple"
          />
          <MetricCard
            title="Cost Alerts"
            value={dashboardData.alertsCount.toString()}
            change={null}
            changeLabel="items need attention"
            icon={ExclamationTriangleIcon}
            color="red"
          />
        </div>

        {/* Charts and Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Cost Trend (Last 30 Days)
            </h3>
            <CostChart data={dashboardData.costBreakdown} />
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Service Cost Breakdown
            </h3>
            <ServiceBreakdown services={dashboardData.topServices} />
          </div>
        </div>

        {/* Top Services Table */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Top Services by Cost
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monthly Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Percentage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trend
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Change
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboardData.costBreakdown.map((service, index) => (
                  <tr key={service.service} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {service.service}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatCurrency(service.cost)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {service.percentage.toFixed(1)}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {service.trend === 'up' && (
                          <ArrowTrendingUpIcon className="h-4 w-4 text-red-500 mr-1" />
                        )}
                        {service.trend === 'down' && (
                          <ArrowTrendingDownIcon className="h-4 w-4 text-green-500 mr-1" />
                        )}
                        <span className={`text-sm capitalize ${
                          service.trend === 'up' ? 'text-red-600' : 
                          service.trend === 'down' ? 'text-green-600' : 
                          'text-gray-600'
                        }`}>
                          {service.trend}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm ${
                        service.change > 0 ? 'text-red-600' : 
                        service.change < 0 ? 'text-green-600' : 
                        'text-gray-600'
                      }`}>
                        {formatPercentage(service.change)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              AI-Powered Optimization Recommendations
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              {state.awsConnected 
                ? 'Personalized recommendations based on your AWS usage patterns'
                : 'General AWS cost optimization best practices and recommendations'
              }
            </p>
          </div>
          <RecommendationsList recommendations={dashboardData.recommendations} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
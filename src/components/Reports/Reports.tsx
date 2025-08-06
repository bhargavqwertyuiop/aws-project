import React, { useState } from 'react';
import { 
  DocumentChartBarIcon, 
  CalendarIcon, 
  EnvelopeIcon,
  ArrowDownTrayIcon,
  EyeIcon 
} from '@heroicons/react/24/outline';

const Reports: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('last30days');

  // Mock historical reports data
  const mockReports = [
    {
      id: 1,
      title: 'November 2024 Cost Optimization Report',
      generatedAt: '2024-11-30T10:00:00Z',
      period: { start: '2024-11-01', end: '2024-11-30' },
      totalCost: 2763.70,
      costChange: 5.8,
      recommendationsCount: 8,
      potentialSavings: 850.50,
      status: 'completed'
    },
    {
      id: 2,
      title: 'October 2024 Cost Optimization Report',
      generatedAt: '2024-10-31T10:00:00Z',
      period: { start: '2024-10-01', end: '2024-10-31' },
      totalCost: 2612.40,
      costChange: -3.2,
      recommendationsCount: 6,
      potentialSavings: 720.30,
      status: 'completed'
    },
    {
      id: 3,
      title: 'September 2024 Cost Optimization Report',
      generatedAt: '2024-09-30T10:00:00Z',
      period: { start: '2024-09-01', end: '2024-09-30' },
      totalCost: 2698.15,
      costChange: 12.1,
      recommendationsCount: 12,
      potentialSavings: 995.80,
      status: 'completed'
    },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const handleGenerateReport = () => {
    // Simulate report generation
    console.log('Generating new report...');
  };

  const handleEmailReport = (reportId: number) => {
    console.log('Emailing report:', reportId);
  };

  const handleDownloadReport = (reportId: number) => {
    console.log('Downloading report:', reportId);
  };

  const handleViewReport = (reportId: number) => {
    console.log('Viewing report:', reportId);
  };

  return (
    <div className="lg:pl-64 min-h-screen bg-gray-50">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Cost Optimization Reports</h1>
              <p className="mt-1 text-sm text-gray-600">
                Historical reports and insights about your AWS cost optimization journey.
              </p>
            </div>
            <button
              onClick={handleGenerateReport}
              className="btn-primary flex items-center"
            >
              <DocumentChartBarIcon className="w-4 h-4 mr-2" />
              Generate New Report
            </button>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <DocumentChartBarIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Reports</p>
                  <p className="text-2xl font-semibold text-gray-900">{mockReports.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <ArrowDownTrayIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Savings Identified</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {formatCurrency(mockReports.reduce((sum, r) => sum + r.potentialSavings, 0))}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <CalendarIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Monthly Cost</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {formatCurrency(mockReports.reduce((sum, r) => sum + r.totalCost, 0) / mockReports.length)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <EnvelopeIcon className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Email Subscriptions</p>
                  <p className="text-2xl font-semibold text-gray-900">Active</p>
                </div>
              </div>
            </div>
          </div>

          {/* Email Subscription Card */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex items-start justify-between">
              <div className="flex items-start">
                <EnvelopeIcon className="h-6 w-6 text-blue-600 mt-1" />
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">Email Report Subscription</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Get weekly cost optimization reports delivered to your inbox automatically.
                  </p>
                  <div className="mt-2 text-sm text-blue-600">
                    ✓ Currently subscribed • Next report: December 8, 2024
                  </div>
                </div>
              </div>
              <button className="btn-secondary text-sm">
                Manage Subscription
              </button>
            </div>
          </div>

          {/* Reports List */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Historical Reports</h2>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="input-field w-auto text-sm"
                >
                  <option value="last30days">Last 30 days</option>
                  <option value="last90days">Last 90 days</option>
                  <option value="last6months">Last 6 months</option>
                  <option value="lastyear">Last year</option>
                </select>
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {mockReports.map((report) => (
                <div key={report.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{report.title}</h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {report.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Generated on {formatDate(report.generatedAt)} • 
                        Period: {formatDate(report.period.start)} to {formatDate(report.period.end)}
                      </p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Total Cost</span>
                          <p className="font-medium text-gray-900">{formatCurrency(report.totalCost)}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Cost Change</span>
                          <p className={`font-medium ${
                            report.costChange >= 0 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {formatPercentage(report.costChange)}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Recommendations</span>
                          <p className="font-medium text-gray-900">{report.recommendationsCount}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Potential Savings</span>
                          <p className="font-medium text-green-600">{formatCurrency(report.potentialSavings)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="ml-6 flex items-center space-x-2">
                      <button
                        onClick={() => handleViewReport(report.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                        title="View Report"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleEmailReport(report.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                        title="Email Report"
                      >
                        <EnvelopeIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDownloadReport(report.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                        title="Download Report"
                      >
                        <ArrowDownTrayIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Empty State (if no reports) */}
          {mockReports.length === 0 && (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <DocumentChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No reports yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Generate your first cost optimization report to get started.
              </p>
              <div className="mt-6">
                <button
                  onClick={handleGenerateReport}
                  className="btn-primary"
                >
                  Generate First Report
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
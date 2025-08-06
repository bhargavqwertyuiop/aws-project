import React, { useState } from 'react';
import {
  LightBulbIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { OptimizationRecommendation } from '../../types';

interface RecommendationsListProps {
  recommendations: OptimizationRecommendation[];
}

const RecommendationsList: React.FC<RecommendationsListProps> = ({ recommendations }) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'hard':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'easy':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getPriorityIcon = (priority: number) => {
    if (priority >= 8) {
      return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
    } else if (priority >= 6) {
      return <InformationCircleIcon className="h-5 w-5 text-yellow-500" />;
    } else {
      return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (recommendations.length === 0) {
    return (
      <div className="p-8 text-center">
        <LightBulbIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No recommendations available</h3>
        <p className="mt-1 text-sm text-gray-500">
          Check back later for optimization suggestions.
        </p>
      </div>
    );
  }

  // Sort recommendations by priority (highest first)
  const sortedRecommendations = [...recommendations].sort((a, b) => b.priority - a.priority);

  return (
    <div className="divide-y divide-gray-200">
      {sortedRecommendations.map((recommendation, index) => {
        const isExpanded = expandedItems.has(recommendation.id);
        
        return (
          <div key={recommendation.id} className="p-6">
            <div className="flex items-start space-x-4">
              {/* Priority Icon */}
              <div className="flex-shrink-0 pt-1">
                {getPriorityIcon(recommendation.priority)}
              </div>

              {/* Main Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-lg font-medium text-gray-900">
                      {recommendation.title}
                    </h4>
                    <p className="mt-1 text-sm text-gray-600">
                      {recommendation.description}
                    </p>
                  </div>

                  {/* Toggle Button */}
                  <button
                    onClick={() => toggleExpanded(recommendation.id)}
                    className="ml-4 p-1 text-gray-400 hover:text-gray-600"
                  >
                    {isExpanded ? (
                      <ChevronDownIcon className="h-5 w-5" />
                    ) : (
                      <ChevronRightIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {/* Quick Info */}
                <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center">
                    <CurrencyDollarIcon className="h-4 w-4 text-green-500 mr-1" />
                    <span className="font-medium text-green-600">
                      {formatCurrency(recommendation.estimatedSavings.amount)}/month
                    </span>
                    <span className="text-gray-500 ml-1">
                      ({recommendation.estimatedSavings.percentage}% savings)
                    </span>
                  </div>

                  <div className="flex items-center">
                    <ClockIcon className="h-4 w-4 text-gray-400 mr-1" />
                    <span className="text-gray-600">
                      {recommendation.implementation.timeToImplement}
                    </span>
                  </div>

                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getImpactColor(recommendation.impact)}`}>
                    {recommendation.impact} impact
                  </span>

                  <span className={`text-xs font-medium ${getDifficultyColor(recommendation.implementation.difficulty)}`}>
                    {recommendation.implementation.difficulty} to implement
                  </span>
                </div>

                {/* Tags */}
                <div className="mt-2 flex flex-wrap gap-1">
                  {recommendation.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {tag}
                    </span>
                  ))}
                  {recommendation.isGeneral && (
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                      General Best Practice
                    </span>
                  )}
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="mt-4 space-y-4">
                    <div>
                      <h5 className="text-sm font-medium text-gray-900 mb-2">
                        Implementation Steps:
                      </h5>
                      <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                        {recommendation.implementation.steps.map((step, stepIndex) => (
                          <li key={stepIndex}>{step}</li>
                        ))}
                      </ol>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-900">Service:</span>
                        <p className="text-gray-600">{recommendation.service}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Category:</span>
                        <p className="text-gray-600 capitalize">{recommendation.category}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Type:</span>
                        <p className="text-gray-600 capitalize">{recommendation.type.replace('_', ' ')}</p>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button className="btn-primary text-sm">
                        Learn More
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RecommendationsList;
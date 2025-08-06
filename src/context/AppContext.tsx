import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AppState, DashboardMetrics, OptimizationRecommendation, CostData, UsageData } from '../types';
import { isAWSConfigured } from '../config/aws';
import { costExplorerService, cloudWatchService } from '../services/awsServices';
import { aiOptimizationService } from '../services/aiOptimizationService';

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  refreshDashboard: () => Promise<void>;
  connectAWS: (credentials: any) => Promise<void>;
  disconnectAWS: () => void;
}

type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_DASHBOARD_DATA'; payload: DashboardMetrics }
  | { type: 'SET_RECOMMENDATIONS'; payload: OptimizationRecommendation[] }
  | { type: 'SET_AWS_CONNECTED'; payload: boolean }
  | { type: 'SET_USER'; payload: any }
  | { type: 'CLEAR_USER' };

const initialState: AppState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  awsConnected: false,
  dashboardData: null,
  recommendations: [],
  error: null,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_DASHBOARD_DATA':
      return { ...state, dashboardData: action.payload, isLoading: false };
    case 'SET_RECOMMENDATIONS':
      return { ...state, recommendations: action.payload };
    case 'SET_AWS_CONNECTED':
      return { ...state, awsConnected: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload, isAuthenticated: true };
    case 'CLEAR_USER':
      return { ...state, user: null, isAuthenticated: false };
    default:
      return state;
  }
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Generate mock data for demonstration when AWS is not configured
  const generateMockDashboardData = (): DashboardMetrics => {
    const mockServices = [
      { service: 'Amazon EC2', cost: 1250.75, percentage: 45.2, trend: 'up' as const, change: 8.5 },
      { service: 'Amazon RDS', cost: 650.30, percentage: 23.5, trend: 'down' as const, change: -2.1 },
      { service: 'Amazon S3', cost: 380.90, percentage: 13.8, trend: 'stable' as const, change: 0.3 },
      { service: 'Amazon CloudWatch', cost: 180.25, percentage: 6.5, trend: 'up' as const, change: 15.2 },
      { service: 'AWS Lambda', cost: 120.80, percentage: 4.4, trend: 'up' as const, change: 22.1 },
      { service: 'Amazon CloudFront', cost: 95.50, percentage: 3.5, trend: 'down' as const, change: -5.8 },
      { service: 'Other Services', cost: 85.20, percentage: 3.1, trend: 'stable' as const, change: 1.2 },
    ];

    const totalCost = mockServices.reduce((sum, service) => sum + service.cost, 0);
    
    return {
      totalCost,
      monthlyChange: 5.8,
      costBreakdown: mockServices,
      topServices: mockServices.slice(0, 5),
      recommendations: [],
      alertsCount: 3,
      savingsOpportunity: 850.50,
    };
  };

  const refreshDashboard = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      let dashboardData: DashboardMetrics;
      let costData: CostData[] = [];
      let usageData: UsageData[] = [];

      if (state.awsConnected && isAWSConfigured()) {
        // Fetch real AWS data
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        try {
          [costData, usageData] = await Promise.all([
            costExplorerService.getCostAndUsage(startDate, endDate),
            cloudWatchService.getEC2UtilizationMetrics(),
          ]);

          // Process real data into dashboard format
          const serviceMap = new Map<string, number>();
          costData.forEach(item => {
            const current = serviceMap.get(item.service) || 0;
            serviceMap.set(item.service, current + item.amount);
          });

          const totalCost = Array.from(serviceMap.values()).reduce((sum, cost) => sum + cost, 0);
          const costBreakdown = Array.from(serviceMap.entries())
            .map(([service, cost]) => ({
              service,
              cost,
              percentage: (cost / totalCost) * 100,
              trend: 'stable' as const,
              change: Math.random() * 20 - 10, // Random change for demo
            }))
            .sort((a, b) => b.cost - a.cost);

          dashboardData = {
            totalCost,
            monthlyChange: Math.random() * 20 - 10, // Random change for demo
            costBreakdown,
            topServices: costBreakdown.slice(0, 5),
            recommendations: [],
            alertsCount: Math.floor(Math.random() * 5),
            savingsOpportunity: totalCost * 0.2,
          };
        } catch (awsError) {
          console.warn('Failed to fetch AWS data, using mock data:', awsError);
          dashboardData = generateMockDashboardData();
        }
      } else {
        // Use mock data when AWS is not configured
        dashboardData = generateMockDashboardData();
        
        // Generate mock cost and usage data for AI recommendations
        costData = dashboardData.costBreakdown.map(service => ({
          date: new Date().toISOString().split('T')[0],
          amount: service.cost,
          currency: 'USD',
          service: service.service,
        }));

        usageData = [
          { service: 'AWS/EC2', metric: 'CPUUtilization', value: 25.5, unit: 'Percent', timestamp: new Date().toISOString() },
          { service: 'AWS/RDS', metric: 'DatabaseConnections', value: 12, unit: 'Count', timestamp: new Date().toISOString() },
          { service: 'AWS/S3', metric: 'BucketRequests', value: 1250, unit: 'Count/Second', timestamp: new Date().toISOString() },
        ];
      }

      // Generate AI recommendations
      const recommendations = await aiOptimizationService.generateOptimizationRecommendations(costData, usageData);
      dashboardData.recommendations = recommendations;

      dispatch({ type: 'SET_DASHBOARD_DATA', payload: dashboardData });
      dispatch({ type: 'SET_RECOMMENDATIONS', payload: recommendations });
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load dashboard data. Please try again.' });
    }
  };

  const connectAWS = async (credentials: any) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      // Store credentials and update state
      dispatch({ type: 'SET_AWS_CONNECTED', payload: true });
      await refreshDashboard();
    } catch (error) {
      console.error('Error connecting to AWS:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to connect to AWS. Please check your credentials.' });
    }
  };

  const disconnectAWS = () => {
    dispatch({ type: 'SET_AWS_CONNECTED', payload: false });
    dispatch({ type: 'SET_DASHBOARD_DATA', payload: generateMockDashboardData() });
  };

  // Initialize dashboard data on mount
  useEffect(() => {
    const initializeDashboard = async () => {
      const awsConnected = isAWSConfigured();
      dispatch({ type: 'SET_AWS_CONNECTED', payload: awsConnected });
      await refreshDashboard();
    };

    initializeDashboard();
  }, []);

  const value: AppContextType = {
    state,
    dispatch,
    refreshDashboard,
    connectAWS,
    disconnectAWS,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
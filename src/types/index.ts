export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  subscriptionStatus: 'active' | 'inactive';
  awsAccountConnected: boolean;
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  emailNotifications: boolean;
  reportFrequency: 'weekly' | 'monthly';
  currency: 'USD' | 'EUR' | 'GBP';
  timeZone: string;
  costThreshold: number;
}

export interface AWSCredentials {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  sessionToken?: string;
}

export interface CostData {
  date: string;
  amount: number;
  currency: string;
  service: string;
  region?: string;
  dimension?: string;
}

export interface UsageData {
  service: string;
  metric: string;
  value: number;
  unit: string;
  timestamp: string;
  dimension?: string;
}

export interface OptimizationRecommendation {
  id: string;
  type: 'cost_reduction' | 'performance' | 'security' | 'general';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  category: string;
  service: string;
  estimatedSavings: {
    amount: number;
    currency: string;
    percentage: number;
  };
  implementation: {
    difficulty: 'easy' | 'medium' | 'hard';
    timeToImplement: string;
    steps: string[];
  };
  tags: string[];
  priority: number;
  isGeneral: boolean;
}

export interface DashboardMetrics {
  totalCost: number;
  monthlyChange: number;
  costBreakdown: ServiceCost[];
  topServices: ServiceCost[];
  recommendations: OptimizationRecommendation[];
  alertsCount: number;
  savingsOpportunity: number;
}

export interface ServiceCost {
  service: string;
  cost: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    borderWidth?: number;
    fill?: boolean;
  }[];
}

export interface EmailSubscription {
  userId: string;
  email: string;
  isActive: boolean;
  frequency: 'weekly' | 'monthly';
  lastSent?: string;
  nextScheduled?: string;
}

export interface ReportData {
  id: string;
  userId: string;
  generatedAt: string;
  period: {
    start: string;
    end: string;
  };
  summary: {
    totalCost: number;
    costChange: number;
    topRecommendations: OptimizationRecommendation[];
    implementedSavings: number;
  };
  details: {
    costBreakdown: ServiceCost[];
    usageTrends: UsageData[];
    newRecommendations: OptimizationRecommendation[];
  };
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  awsConnected: boolean;
  dashboardData: DashboardMetrics | null;
  recommendations: OptimizationRecommendation[];
  error: string | null;
}
import OpenAI from 'openai';
import { OPENAI_CONFIG } from '../config/aws';
import { OptimizationRecommendation, CostData, UsageData } from '../types';

class AIOptimizationService {
  private openai: OpenAI | null = null;

  private getOpenAIClient(): OpenAI {
    if (!this.openai && OPENAI_CONFIG.apiKey) {
      this.openai = new OpenAI({
        apiKey: OPENAI_CONFIG.apiKey,
        dangerouslyAllowBrowser: true, // Note: In production, this should be handled by a backend
      });
    }
    return this.openai!;
  }

  public async generateOptimizationRecommendations(
    costData: CostData[],
    usageData: UsageData[]
  ): Promise<OptimizationRecommendation[]> {
    try {
      if (!OPENAI_CONFIG.apiKey) {
        console.warn('OpenAI API key not configured, using generalized recommendations');
        return this.getGeneralizedRecommendations();
      }

      const client = this.getOpenAIClient();
      const prompt = this.createOptimizationPrompt(costData, usageData);

      const completion = await client.chat.completions.create({
        model: OPENAI_CONFIG.model,
        messages: [
          {
            role: 'system',
            content: `You are an AWS cost optimization expert. Analyze the provided cost and usage data to generate specific, actionable recommendations for reducing AWS costs while maintaining performance and reliability. 

            Return your response as a JSON array of recommendations with the following structure:
            {
              "id": "unique_id",
              "type": "cost_reduction" | "performance" | "security" | "general",
              "title": "Brief title",
              "description": "Detailed description",
              "impact": "low" | "medium" | "high",
              "category": "compute" | "storage" | "network" | "database" | "other",
              "service": "AWS service name",
              "estimatedSavings": {
                "amount": number,
                "currency": "USD",
                "percentage": number
              },
              "implementation": {
                "difficulty": "easy" | "medium" | "hard",
                "timeToImplement": "time estimate",
                "steps": ["step1", "step2", ...]
              },
              "tags": ["tag1", "tag2"],
              "priority": number (1-10),
              "isGeneral": false
            }

            Focus on practical, implementable recommendations based on the actual data provided.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: OPENAI_CONFIG.maxTokens,
        temperature: 0.3,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        return this.getGeneralizedRecommendations();
      }

      try {
        const recommendations = JSON.parse(response) as OptimizationRecommendation[];
        return recommendations.map((rec, index) => ({
          ...rec,
          id: rec.id || `ai_rec_${index}`,
          isGeneral: false,
        }));
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        return this.getGeneralizedRecommendations();
      }
    } catch (error) {
      console.error('Error generating AI recommendations:', error);
      return this.getGeneralizedRecommendations();
    }
  }

  private createOptimizationPrompt(costData: CostData[], usageData: UsageData[]): string {
    const totalCost = costData.reduce((sum, item) => sum + item.amount, 0);
    const topServices = costData
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)
      .map(item => `${item.service}: $${item.amount.toFixed(2)}`)
      .join(', ');

    const usageSummary = usageData
      .map(item => `${item.service} ${item.metric}: ${item.value.toFixed(2)} ${item.unit}`)
      .slice(0, 10)
      .join(', ');

    return `
    Analyze the following AWS cost and usage data to provide optimization recommendations:

    COST SUMMARY:
    - Total monthly cost: $${totalCost.toFixed(2)}
    - Top services by cost: ${topServices}
    
    USAGE METRICS:
    ${usageSummary}
    
    DETAILED COST DATA:
    ${JSON.stringify(costData.slice(0, 20), null, 2)}
    
    DETAILED USAGE DATA:
    ${JSON.stringify(usageData.slice(0, 20), null, 2)}
    
    Please provide 5-8 specific optimization recommendations based on this data. Focus on:
    1. Services with highest costs
    2. Underutilized resources
    3. Potential architecture improvements
    4. Reserved instance opportunities
    5. Storage optimization
    6. Network optimization
    
    Prioritize recommendations by potential savings and ease of implementation.
    `;
  }

  public getGeneralizedRecommendations(): OptimizationRecommendation[] {
    return [
      {
        id: 'general_ec2_rightsizing',
        type: 'cost_reduction',
        title: 'Right-size EC2 Instances',
        description: 'Analyze your EC2 instances for CPU and memory utilization. Many instances run at less than 20% utilization and can be downsized. Use AWS Compute Optimizer to identify right-sizing opportunities.',
        impact: 'high',
        category: 'compute',
        service: 'Amazon EC2',
        estimatedSavings: {
          amount: 500,
          currency: 'USD',
          percentage: 20,
        },
        implementation: {
          difficulty: 'easy',
          timeToImplement: '1-2 weeks',
          steps: [
            'Enable AWS Compute Optimizer',
            'Review CPU and memory utilization metrics',
            'Identify underutilized instances',
            'Test workloads on smaller instance types',
            'Implement changes during maintenance windows',
          ],
        },
        tags: ['ec2', 'rightsizing', 'compute'],
        priority: 9,
        isGeneral: true,
      },
      {
        id: 'general_reserved_instances',
        type: 'cost_reduction',
        title: 'Purchase Reserved Instances',
        description: 'For stable, predictable workloads running 24/7, Reserved Instances can provide up to 75% savings compared to On-Demand pricing. Start with 1-year terms for flexibility.',
        impact: 'high',
        category: 'compute',
        service: 'Amazon EC2',
        estimatedSavings: {
          amount: 800,
          currency: 'USD',
          percentage: 40,
        },
        implementation: {
          difficulty: 'medium',
          timeToImplement: '2-4 weeks',
          steps: [
            'Analyze usage patterns for the last 12 months',
            'Identify consistently running instances',
            'Calculate potential savings',
            'Purchase Reserved Instances for stable workloads',
            'Monitor utilization and coverage',
          ],
        },
        tags: ['reserved-instances', 'ec2', 'commitment'],
        priority: 8,
        isGeneral: true,
      },
      {
        id: 'general_s3_storage_classes',
        type: 'cost_reduction',
        title: 'Optimize S3 Storage Classes',
        description: 'Use S3 Intelligent-Tiering or lifecycle policies to automatically move objects to cheaper storage classes (IA, Glacier) based on access patterns. This can reduce storage costs by 40-60%.',
        impact: 'medium',
        category: 'storage',
        service: 'Amazon S3',
        estimatedSavings: {
          amount: 300,
          currency: 'USD',
          percentage: 50,
        },
        implementation: {
          difficulty: 'easy',
          timeToImplement: '1 week',
          steps: [
            'Enable S3 Storage Analytics',
            'Analyze access patterns for your buckets',
            'Configure S3 Intelligent-Tiering',
            'Set up lifecycle policies',
            'Monitor cost changes',
          ],
        },
        tags: ['s3', 'storage', 'lifecycle'],
        priority: 7,
        isGeneral: true,
      },
      {
        id: 'general_unused_resources',
        type: 'cost_reduction',
        title: 'Identify and Remove Unused Resources',
        description: 'Regularly audit for unused EBS volumes, Elastic IPs, load balancers, and NAT gateways. These resources incur charges even when not actively used.',
        impact: 'medium',
        category: 'compute',
        service: 'Various',
        estimatedSavings: {
          amount: 200,
          currency: 'USD',
          percentage: 10,
        },
        implementation: {
          difficulty: 'easy',
          timeToImplement: '3-5 days',
          steps: [
            'Use AWS Config to identify unused resources',
            'Check for unattached EBS volumes',
            'Review unused Elastic IP addresses',
            'Identify idle load balancers',
            'Set up automated cleanup policies',
          ],
        },
        tags: ['cleanup', 'unused-resources', 'audit'],
        priority: 6,
        isGeneral: true,
      },
      {
        id: 'general_spot_instances',
        type: 'cost_reduction',
        title: 'Use Spot Instances for Fault-Tolerant Workloads',
        description: 'For batch processing, data analysis, and development environments, Spot Instances can provide up to 90% savings. Use Auto Scaling groups with mixed instance types.',
        impact: 'high',
        category: 'compute',
        service: 'Amazon EC2',
        estimatedSavings: {
          amount: 600,
          currency: 'USD',
          percentage: 70,
        },
        implementation: {
          difficulty: 'medium',
          timeToImplement: '2-3 weeks',
          steps: [
            'Identify fault-tolerant workloads',
            'Design applications for interruption handling',
            'Configure Auto Scaling with Spot Fleet',
            'Test spot interruption scenarios',
            'Monitor savings and availability',
          ],
        },
        tags: ['spot-instances', 'ec2', 'interruption-tolerant'],
        priority: 7,
        isGeneral: true,
      },
      {
        id: 'general_cloudwatch_logs',
        type: 'cost_reduction',
        title: 'Optimize CloudWatch Logs Retention',
        description: 'Set appropriate log retention periods and use CloudWatch Logs Insights instead of storing all logs indefinitely. Consider archiving old logs to S3.',
        impact: 'low',
        category: 'other',
        service: 'Amazon CloudWatch',
        estimatedSavings: {
          amount: 100,
          currency: 'USD',
          percentage: 30,
        },
        implementation: {
          difficulty: 'easy',
          timeToImplement: '2-3 days',
          steps: [
            'Review current log retention settings',
            'Set retention periods based on compliance needs',
            'Archive old logs to S3',
            'Use log filtering to reduce ingestion',
            'Monitor log storage costs',
          ],
        },
        tags: ['cloudwatch', 'logs', 'retention'],
        priority: 4,
        isGeneral: true,
      },
      {
        id: 'general_rds_optimization',
        type: 'cost_reduction',
        title: 'Optimize RDS Instances and Storage',
        description: 'Right-size RDS instances, use gp3 storage, enable automated backups optimization, and consider Aurora Serverless for variable workloads.',
        impact: 'medium',
        category: 'database',
        service: 'Amazon RDS',
        estimatedSavings: {
          amount: 400,
          currency: 'USD',
          percentage: 25,
        },
        implementation: {
          difficulty: 'medium',
          timeToImplement: '1-2 weeks',
          steps: [
            'Analyze RDS performance metrics',
            'Right-size instances based on CPU/Memory usage',
            'Migrate to gp3 storage',
            'Optimize backup retention',
            'Consider Aurora Serverless for dev/test',
          ],
        },
        tags: ['rds', 'database', 'aurora'],
        priority: 6,
        isGeneral: true,
      },
      {
        id: 'general_data_transfer',
        type: 'cost_reduction',
        title: 'Minimize Data Transfer Costs',
        description: 'Use CloudFront for content delivery, optimize inter-region data transfer, and consider VPC endpoints for AWS service communications to reduce NAT gateway costs.',
        impact: 'medium',
        category: 'network',
        service: 'Various',
        estimatedSavings: {
          amount: 250,
          currency: 'USD',
          percentage: 40,
        },
        implementation: {
          difficulty: 'medium',
          timeToImplement: '2-4 weeks',
          steps: [
            'Analyze data transfer patterns',
            'Set up CloudFront distributions',
            'Configure VPC endpoints',
            'Optimize cross-region replication',
            'Monitor network costs',
          ],
        },
        tags: ['data-transfer', 'cloudfront', 'vpc-endpoints'],
        priority: 5,
        isGeneral: true,
      },
    ];
  }

  public async analyzeServiceCosts(costData: CostData[]): Promise<{
    topExpensiveServices: string[];
    growingServices: string[];
    optimizationPriority: string[];
  }> {
    if (costData.length === 0) {
      return {
        topExpensiveServices: ['EC2', 'RDS', 'S3'],
        growingServices: ['Lambda', 'CloudWatch'],
        optimizationPriority: ['EC2', 'S3', 'RDS'],
      };
    }

    const serviceMap = new Map<string, { cost: number, trend: number }>();
    
    costData.forEach((item) => {
      const existing = serviceMap.get(item.service) || { cost: 0, trend: 0 };
      serviceMap.set(item.service, {
        cost: existing.cost + item.amount,
        trend: existing.trend + item.amount, // Simplified trend calculation
      });
    });

    const sortedByCost = Array.from(serviceMap.entries())
      .sort(([, a], [, b]) => b.cost - a.cost);

    const topExpensiveServices = sortedByCost.slice(0, 5).map(([service]) => service);
    const growingServices = sortedByCost
      .filter(([, data]) => data.trend > 0)
      .slice(0, 3)
      .map(([service]) => service);

    return {
      topExpensiveServices,
      growingServices,
      optimizationPriority: topExpensiveServices,
    };
  }

  public generateCustomRecommendation(
    service: string,
    costAmount: number,
    utilizationData?: UsageData[]
  ): OptimizationRecommendation {
    const baseRecommendations = this.getServiceSpecificRecommendations();
    const serviceRec = baseRecommendations[service] || baseRecommendations['default'];

    return {
      ...serviceRec,
      id: `custom_${service}_${Date.now()}`,
      estimatedSavings: {
        ...serviceRec.estimatedSavings,
        amount: Math.max(50, costAmount * 0.2), // Estimate 20% savings
      },
      isGeneral: true,
    };
  }

  private getServiceSpecificRecommendations(): Record<string, Partial<OptimizationRecommendation>> {
    return {
      'Amazon EC2': {
        type: 'cost_reduction',
        title: 'Optimize EC2 Instance Usage',
        description: 'Consider right-sizing instances, using Reserved Instances, or Spot Instances for cost savings.',
        impact: 'high',
        category: 'compute',
        service: 'Amazon EC2',
        estimatedSavings: { amount: 300, currency: 'USD', percentage: 30 },
        implementation: {
          difficulty: 'medium',
          timeToImplement: '1-2 weeks',
          steps: ['Analyze utilization', 'Right-size instances', 'Consider Reserved Instances'],
        },
        tags: ['ec2', 'compute'],
        priority: 8,
      },
      'Amazon S3': {
        type: 'cost_reduction',
        title: 'Optimize S3 Storage Costs',
        description: 'Use appropriate storage classes and lifecycle policies to reduce storage costs.',
        impact: 'medium',
        category: 'storage',
        service: 'Amazon S3',
        estimatedSavings: { amount: 200, currency: 'USD', percentage: 40 },
        implementation: {
          difficulty: 'easy',
          timeToImplement: '3-5 days',
          steps: ['Configure storage classes', 'Set lifecycle policies', 'Enable intelligent tiering'],
        },
        tags: ['s3', 'storage'],
        priority: 6,
      },
      'default': {
        type: 'cost_reduction',
        title: 'Service Cost Optimization',
        description: 'Review usage patterns and consider optimization opportunities for this service.',
        impact: 'medium',
        category: 'other',
        service: 'Various',
        estimatedSavings: { amount: 100, currency: 'USD', percentage: 15 },
        implementation: {
          difficulty: 'medium',
          timeToImplement: '1 week',
          steps: ['Analyze usage', 'Research optimization options', 'Implement changes'],
        },
        tags: ['optimization'],
        priority: 5,
      },
    };
  }
}

export const aiOptimizationService = new AIOptimizationService();
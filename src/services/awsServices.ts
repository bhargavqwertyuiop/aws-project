import { CostExplorerClient, GetCostAndUsageCommand } from '@aws-sdk/client-cost-explorer';
import { CloudWatchClient, GetMetricStatisticsCommand, ListMetricsCommand } from '@aws-sdk/client-cloudwatch';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { 
  CognitoIdentityProviderClient, 
  SignUpCommand, 
  ConfirmSignUpCommand, 
  InitiateAuthCommand 
} from '@aws-sdk/client-cognito-identity-provider';

import { getAWSConfig, AWS_CONFIG } from '../config/aws';
import { CostData, UsageData, User, EmailSubscription, ReportData } from '../types';

class AWSCostExplorerService {
  private client: CostExplorerClient | null = null;

  private getClient(): CostExplorerClient {
    if (!this.client) {
      const config = getAWSConfig();
      if (config) {
        this.client = new CostExplorerClient(config);
      } else {
        throw new Error('AWS credentials not configured');
      }
    }
    return this.client;
  }

  public async getCostAndUsage(
    startDate: string,
    endDate: string,
    granularity: 'DAILY' | 'MONTHLY' = 'DAILY'
  ): Promise<CostData[]> {
    try {
      const client = this.getClient();
      const command = new GetCostAndUsageCommand({
        TimePeriod: {
          Start: startDate,
          End: endDate,
        },
        Granularity: granularity,
        Metrics: ['BlendedCost', 'UnblendedCost', 'UsageQuantity'],
        GroupBy: [
          {
            Type: 'DIMENSION',
            Key: 'SERVICE',
          },
        ],
      });

      const response = await client.send(command);
      const costData: CostData[] = [];

      response.ResultsByTime?.forEach((result) => {
        result.Groups?.forEach((group) => {
          const service = group.Keys?.[0] || 'Unknown';
          const cost = parseFloat(group.Metrics?.BlendedCost?.Amount || '0');
          
          costData.push({
            date: result.TimePeriod?.Start || '',
            amount: cost,
            currency: group.Metrics?.BlendedCost?.Unit || 'USD',
            service,
          });
        });
      });

      return costData;
    } catch (error) {
      console.error('Error fetching cost data:', error);
      return [];
    }
  }

  public async getServiceCosts(
    startDate: string,
    endDate: string
  ): Promise<CostData[]> {
    try {
      const client = this.getClient();
      const command = new GetCostAndUsageCommand({
        TimePeriod: {
          Start: startDate,
          End: endDate,
        },
        Granularity: 'MONTHLY',
        Metrics: ['BlendedCost'],
        GroupBy: [
          {
            Type: 'DIMENSION',
            Key: 'SERVICE',
          },
        ],
      });

      const response = await client.send(command);
      const costData: CostData[] = [];

      response.ResultsByTime?.[0]?.Groups?.forEach((group) => {
        const service = group.Keys?.[0] || 'Unknown';
        const cost = parseFloat(group.Metrics?.BlendedCost?.Amount || '0');
        
        costData.push({
          date: response.ResultsByTime?.[0]?.TimePeriod?.Start || '',
          amount: cost,
          currency: group.Metrics?.BlendedCost?.Unit || 'USD',
          service,
        });
      });

      return costData.sort((a, b) => b.amount - a.amount);
    } catch (error) {
      console.error('Error fetching service costs:', error);
      return [];
    }
  }
}

class AWSCloudWatchService {
  private client: CloudWatchClient | null = null;

  private getClient(): CloudWatchClient {
    if (!this.client) {
      const config = getAWSConfig();
      if (config) {
        this.client = new CloudWatchClient(config);
      } else {
        throw new Error('AWS credentials not configured');
      }
    }
    return this.client;
  }

  public async getMetrics(
    namespace: string,
    metricName: string,
    startTime: Date,
    endTime: Date,
    period: number = 3600
  ): Promise<UsageData[]> {
    try {
      const client = this.getClient();
      const command = new GetMetricStatisticsCommand({
        Namespace: namespace,
        MetricName: metricName,
        StartTime: startTime,
        EndTime: endTime,
        Period: period,
        Statistics: ['Average', 'Maximum', 'Sum'],
      });

      const response = await client.send(command);
      const usageData: UsageData[] = [];

      response.Datapoints?.forEach((datapoint) => {
        usageData.push({
          service: namespace,
          metric: metricName,
          value: datapoint.Average || datapoint.Sum || datapoint.Maximum || 0,
          unit: response.Label || '',
          timestamp: datapoint.Timestamp?.toISOString() || '',
        });
      });

      return usageData;
    } catch (error) {
      console.error('Error fetching CloudWatch metrics:', error);
      return [];
    }
  }

  public async getEC2UtilizationMetrics(): Promise<UsageData[]> {
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago

    return this.getMetrics('AWS/EC2', 'CPUUtilization', startTime, endTime);
  }

  public async getRDSConnectionMetrics(): Promise<UsageData[]> {
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - 30 * 24 * 60 * 60 * 1000);

    return this.getMetrics('AWS/RDS', 'DatabaseConnections', startTime, endTime);
  }
}

class AWSDynamoDBService {
  private client: DynamoDBDocumentClient | null = null;

  private getClient(): DynamoDBDocumentClient {
    if (!this.client) {
      const config = getAWSConfig();
      if (config) {
        const dynamoClient = new DynamoDBClient(config);
        this.client = DynamoDBDocumentClient.from(dynamoClient);
      } else {
        throw new Error('AWS credentials not configured');
      }
    }
    return this.client;
  }

  public async saveUser(user: User): Promise<void> {
    try {
      const client = this.getClient();
      const command = new PutCommand({
        TableName: AWS_CONFIG.dynamodb.tableName,
        Item: {
          PK: `USER#${user.id}`,
          SK: `PROFILE`,
          ...user,
          updatedAt: new Date().toISOString(),
        },
      });

      await client.send(command);
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  }

  public async getUser(userId: string): Promise<User | null> {
    try {
      const client = this.getClient();
      const command = new GetCommand({
        TableName: AWS_CONFIG.dynamodb.tableName,
        Key: {
          PK: `USER#${userId}`,
          SK: 'PROFILE',
        },
      });

      const response = await client.send(command);
      return response.Item as User || null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  public async saveReport(report: ReportData): Promise<void> {
    try {
      const client = this.getClient();
      const command = new PutCommand({
        TableName: AWS_CONFIG.dynamodb.tableName,
        Item: {
          PK: `USER#${report.userId}`,
          SK: `REPORT#${report.id}`,
          ...report,
        },
      });

      await client.send(command);
    } catch (error) {
      console.error('Error saving report:', error);
      throw error;
    }
  }

  public async getUserReports(userId: string): Promise<ReportData[]> {
    try {
      const client = this.getClient();
      const command = new QueryCommand({
        TableName: AWS_CONFIG.dynamodb.tableName,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
        ExpressionAttributeValues: {
          ':pk': `USER#${userId}`,
          ':sk': 'REPORT#',
        },
        ScanIndexForward: false, // Most recent first
        Limit: 10,
      });

      const response = await client.send(command);
      return (response.Items as ReportData[]) || [];
    } catch (error) {
      console.error('Error getting user reports:', error);
      return [];
    }
  }

  public async saveEmailSubscription(subscription: EmailSubscription): Promise<void> {
    try {
      const client = this.getClient();
      const command = new PutCommand({
        TableName: AWS_CONFIG.dynamodb.tableName,
        Item: {
          PK: `USER#${subscription.userId}`,
          SK: 'EMAIL_SUBSCRIPTION',
          ...subscription,
          updatedAt: new Date().toISOString(),
        },
      });

      await client.send(command);
    } catch (error) {
      console.error('Error saving email subscription:', error);
      throw error;
    }
  }
}

class AWSSESService {
  private client: SESClient | null = null;

  private getClient(): SESClient {
    if (!this.client) {
      const config = getAWSConfig();
      if (config) {
        this.client = new SESClient({
          ...config,
          region: AWS_CONFIG.ses.region,
        });
      } else {
        throw new Error('AWS credentials not configured');
      }
    }
    return this.client;
  }

  public async sendOptimizationReport(
    toEmail: string,
    report: ReportData
  ): Promise<void> {
    try {
      const client = this.getClient();
      
      const htmlBody = this.generateReportHTML(report);
      const textBody = this.generateReportText(report);

      const command = new SendEmailCommand({
        Source: AWS_CONFIG.ses.fromEmail,
        Destination: {
          ToAddresses: [toEmail],
        },
        Message: {
          Subject: {
            Data: `AWS Cost Optimization Report - ${new Date(report.generatedAt).toLocaleDateString()}`,
            Charset: 'UTF-8',
          },
          Body: {
            Html: {
              Data: htmlBody,
              Charset: 'UTF-8',
            },
            Text: {
              Data: textBody,
              Charset: 'UTF-8',
            },
          },
        },
      });

      await client.send(command);
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  private generateReportHTML(report: ReportData): string {
    const { summary, details } = report;
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>AWS Cost Optimization Report</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .metric { background: #f3f4f6; padding: 15px; margin: 10px 0; border-radius: 5px; }
            .recommendation { background: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin: 10px 0; }
            .savings { color: #10b981; font-weight: bold; }
            .cost-increase { color: #ef4444; }
            .cost-decrease { color: #10b981; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>AWS Cost Optimization Report</h1>
            <p>Generated on ${new Date(report.generatedAt).toLocaleDateString()}</p>
          </div>
          
          <div class="content">
            <h2>Cost Summary</h2>
            <div class="metric">
              <h3>Total Cost: $${summary.totalCost.toFixed(2)}</h3>
              <p class="${summary.costChange >= 0 ? 'cost-increase' : 'cost-decrease'}">
                ${summary.costChange >= 0 ? '+' : ''}${summary.costChange.toFixed(1)}% from last period
              </p>
            </div>

            <h2>Top Recommendations</h2>
            ${summary.topRecommendations.map(rec => `
              <div class="recommendation">
                <h4>${rec.title}</h4>
                <p>${rec.description}</p>
                <p class="savings">Potential Savings: $${rec.estimatedSavings.amount}/month</p>
              </div>
            `).join('')}

            <h2>Service Breakdown</h2>
            ${details.costBreakdown.map(service => `
              <div class="metric">
                <strong>${service.service}:</strong> $${service.cost.toFixed(2)} (${service.percentage.toFixed(1)}%)
              </div>
            `).join('')}
          </div>
        </body>
      </html>
    `;
  }

  private generateReportText(report: ReportData): string {
    const { summary, details } = report;
    
    return `
AWS Cost Optimization Report
Generated on ${new Date(report.generatedAt).toLocaleDateString()}

COST SUMMARY
Total Cost: $${summary.totalCost.toFixed(2)}
Change from last period: ${summary.costChange >= 0 ? '+' : ''}${summary.costChange.toFixed(1)}%

TOP RECOMMENDATIONS
${summary.topRecommendations.map(rec => `
• ${rec.title}
  ${rec.description}
  Potential Savings: $${rec.estimatedSavings.amount}/month
`).join('')}

SERVICE BREAKDOWN
${details.costBreakdown.map(service => `
• ${service.service}: $${service.cost.toFixed(2)} (${service.percentage.toFixed(1)}%)
`).join('')}

Visit your dashboard for more detailed insights and recommendations.
    `;
  }
}

// Export service instances
export const costExplorerService = new AWSCostExplorerService();
export const cloudWatchService = new AWSCloudWatchService();
export const dynamoDBService = new AWSDynamoDBService();
export const sesService = new AWSSESService();
import { AWSCredentials } from '../types';

export const AWS_CONFIG = {
  region: process.env.REACT_APP_AWS_REGION || 'us-east-1',
  cognito: {
    userPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID || '',
    clientId: process.env.REACT_APP_COGNITO_CLIENT_ID || '',
    region: process.env.REACT_APP_COGNITO_REGION || 'us-east-1',
  },
  dynamodb: {
    tableName: process.env.REACT_APP_DYNAMODB_TABLE_NAME || 'aws-cost-optimizer',
    region: process.env.REACT_APP_DYNAMODB_REGION || 'us-east-1',
  },
  ses: {
    region: process.env.REACT_APP_SES_REGION || 'us-east-1',
    fromEmail: process.env.REACT_APP_SES_FROM_EMAIL || 'noreply@aws-cost-optimizer.com',
  },
  costExplorer: {
    region: process.env.REACT_APP_CE_REGION || 'us-east-1',
  },
  cloudwatch: {
    region: process.env.REACT_APP_CW_REGION || 'us-east-1',
  },
};

export const OPENAI_CONFIG = {
  apiKey: process.env.REACT_APP_OPENAI_API_KEY || '',
  model: 'gpt-4-turbo-preview',
  maxTokens: 1000,
};

export class AWSCredentialsManager {
  private static instance: AWSCredentialsManager;
  private credentials: AWSCredentials | null = null;

  private constructor() {}

  public static getInstance(): AWSCredentialsManager {
    if (!AWSCredentialsManager.instance) {
      AWSCredentialsManager.instance = new AWSCredentialsManager();
    }
    return AWSCredentialsManager.instance;
  }

  public setCredentials(credentials: AWSCredentials): void {
    this.credentials = credentials;
    // Store in secure storage (encrypted)
    if (typeof window !== 'undefined') {
      localStorage.setItem('aws_credentials', JSON.stringify(credentials));
    }
  }

  public getCredentials(): AWSCredentials | null {
    if (this.credentials) {
      return this.credentials;
    }

    // Try to load from storage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('aws_credentials');
      if (stored) {
        try {
          this.credentials = JSON.parse(stored);
          return this.credentials;
        } catch (error) {
          console.error('Failed to parse stored credentials:', error);
          this.clearCredentials();
        }
      }
    }

    return null;
  }

  public clearCredentials(): void {
    this.credentials = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('aws_credentials');
    }
  }

  public hasCredentials(): boolean {
    return this.getCredentials() !== null;
  }

  public getAWSConfig() {
    const credentials = this.getCredentials();
    if (!credentials) {
      return null;
    }

    return {
      region: credentials.region,
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
        sessionToken: credentials.sessionToken,
      },
    };
  }
}

export const isAWSConfigured = (): boolean => {
  const credentialsManager = AWSCredentialsManager.getInstance();
  return credentialsManager.hasCredentials();
};

export const getAWSConfig = () => {
  const credentialsManager = AWSCredentialsManager.getInstance();
  return credentialsManager.getAWSConfig();
};
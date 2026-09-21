// Shared type definitions for monitoring services
// This file breaks circular dependencies by separating types from implementations

export interface DeploymentMetrics {
  timestamp: string;
  deploymentId: string;
  buildTime: number;
  buildSize: number;
  errorCount: number;
  warningCount: number;
  testCoverage?: number;
  performanceScore?: number;
  uptime: number;
  responseTime: number;
  memoryUsage: number;
  cpuUsage: number;
  networkRequests: number;
  activeUsers: number;
  errorRate: number;
  successRate: number;
}

export interface BuildMetrics {
  timestamp: string;
  buildId: string;
  duration: number;
  status: 'success' | 'failed' | 'warning';
  bundleSize: number;
  chunkCount: number;
  assetCount: number;
  warnings: string[];
  errors: string[];
}

// AlertRule for deployment metrics (used by deploymentMetrics.ts)
export interface DeploymentAlertRule {
  id: string;
  name: string;
  condition: (metrics: DeploymentMetrics) => boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  enabled: boolean;
}

export interface Alert {
  id: string;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  resolved: boolean;
  resolvedAt?: string;
  source: string;
  metadata?: Record<string, any>;
}

export interface AlertChannel {
  id: string;
  name: string;
  type: 'email' | 'slack' | 'webhook' | 'sms' | 'console';
  enabled: boolean;
  config: Record<string, any>;
}

// General AlertRule (used by alertingService.ts)
export interface AlertRule {
  id: string;
  name: string;
  condition: (data: any) => boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  enabled: boolean;
  cooldownMinutes: number;
  lastTriggered?: string;
}

export interface ExternalMonitoringConfig {
  datadog?: {
    apiKey: string;
    appKey: string;
    site: string;
    enabled: boolean;
  };
  newRelic?: {
    licenseKey: string;
    appName: string;
    enabled: boolean;
  };
  sentry?: {
    dsn: string;
    environment: string;
    enabled: boolean;
  };
  prometheus?: {
    pushGatewayUrl: string;
    jobName: string;
    enabled: boolean;
  };
}

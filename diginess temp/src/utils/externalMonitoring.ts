import { logger } from './logger';
import type { DeploymentMetrics, BuildMetrics, ExternalMonitoringConfig } from './monitoringTypes';

export type { DeploymentMetrics, BuildMetrics, ExternalMonitoringConfig };

class ExternalMonitoringService {
  private config: ExternalMonitoringConfig = {};

  constructor() {
    this.loadConfig();
  }

  private loadConfig() {
    try {
      // Load from environment variables
      this.config = {
        datadog: {
          apiKey: process.env.DATADOG_API_KEY || '',
          appKey: process.env.DATADOG_APP_KEY || '',
          site: process.env.DATADOG_SITE || 'datadoghq.com',
          enabled: Boolean(process.env.DATADOG_API_KEY),
        },
        newRelic: {
          licenseKey: process.env.NEW_RELIC_LICENSE_KEY || '',
          appName: process.env.NEW_RELIC_APP_NAME || 'SSPL',
          enabled: Boolean(process.env.NEW_RELIC_LICENSE_KEY),
        },
        sentry: {
          dsn: process.env.SENTRY_DSN || '',
          environment: process.env.NODE_ENV || 'development',
          enabled: Boolean(process.env.SENTRY_DSN),
        },
        prometheus: {
          pushGatewayUrl: process.env.PROMETHEUS_PUSHGATEWAY_URL || '',
          jobName: process.env.PROMETHEUS_JOB_NAME || 'sspl',
          enabled: Boolean(process.env.PROMETHEUS_PUSHGATEWAY_URL),
        },
      };
    } catch (error) {
      logger.error('Failed to load external monitoring config', { error });
    }
  }

  // Send deployment metrics to external services
  async sendDeploymentMetrics(metrics: DeploymentMetrics): Promise<void> {
    const promises = [];

    if (this.config.datadog?.enabled) {
      promises.push(this.sendToDataDog(metrics));
    }

    if (this.config.newRelic?.enabled) {
      promises.push(this.sendToNewRelic(metrics));
    }

    if (this.config.prometheus?.enabled) {
      promises.push(this.sendToPrometheus(metrics));
    }

    try {
      await Promise.allSettled(promises);
    } catch (error) {
      logger.error('Failed to send metrics to external services', { error });
    }
  }

  // Send build metrics to external services
  async sendBuildMetrics(metrics: BuildMetrics): Promise<void> {
    const promises = [];

    if (this.config.datadog?.enabled) {
      promises.push(this.sendBuildToDataDog(metrics));
    }

    if (this.config.newRelic?.enabled) {
      promises.push(this.sendBuildToNewRelic(metrics));
    }

    if (this.config.prometheus?.enabled) {
      promises.push(this.sendBuildToPrometheus(metrics));
    }

    try {
      await Promise.allSettled(promises);
    } catch (error) {
      logger.error('Failed to send build metrics to external services', { error });
    }
  }

  // DataDog integration
  private async sendToDataDog(metrics: DeploymentMetrics): Promise<void> {
    if (!this.config.datadog) return;

    const { apiKey, appKey, site } = this.config.datadog;

    const series = [
      {
        metric: 'sspl.deployment.uptime',
        points: [[Math.floor(Date.now() / 1000), metrics.uptime]],
        tags: [`deployment:${metrics.deploymentId}`, `environment:${process.env.NODE_ENV || 'development'}`],
      },
      {
        metric: 'sspl.deployment.response_time',
        points: [[Math.floor(Date.now() / 1000), metrics.responseTime]],
        tags: [`deployment:${metrics.deploymentId}`, `environment:${process.env.NODE_ENV || 'development'}`],
      },
      {
        metric: 'sspl.deployment.error_rate',
        points: [[Math.floor(Date.now() / 1000), metrics.errorRate]],
        tags: [`deployment:${metrics.deploymentId}`, `environment:${process.env.NODE_ENV || 'development'}`],
      },
      {
        metric: 'sspl.deployment.memory_usage',
        points: [[Math.floor(Date.now() / 1000), metrics.memoryUsage]],
        tags: [`deployment:${metrics.deploymentId}`, `environment:${process.env.NODE_ENV || 'development'}`],
      },
      {
        metric: 'sspl.deployment.active_users',
        points: [[Math.floor(Date.now() / 1000), metrics.activeUsers]],
        tags: [`deployment:${metrics.deploymentId}`, `environment:${process.env.NODE_ENV || 'development'}`],
      },
    ];

    try {
      const response = await fetch(`https://api.${site}/api/v1/series`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'DD-API-KEY': apiKey,
          'DD-APPLICATION-KEY': appKey,
        },
        body: JSON.stringify({ series }),
      });

      if (!response.ok) {
        throw new Error(`DataDog API returned ${response.status}`);
      }

      logger.info('Successfully sent metrics to DataDog');
    } catch (error) {
      logger.error('Failed to send metrics to DataDog', { error });
      throw error;
    }
  }

  // New Relic integration
  private async sendToNewRelic(metrics: DeploymentMetrics): Promise<void> {
    if (!this.config.newRelic) return;

    const { licenseKey, appName } = this.config.newRelic;

    const event = {
      eventType: 'SSPLDeploymentMetrics',
      timestamp: Date.now(),
      deploymentId: metrics.deploymentId,
      uptime: metrics.uptime,
      responseTime: metrics.responseTime,
      errorRate: metrics.errorRate,
      memoryUsage: metrics.memoryUsage,
      activeUsers: metrics.activeUsers,
      successRate: metrics.successRate,
      environment: process.env.NODE_ENV || 'development',
      appName,
    };

    try {
      const response = await fetch('https://insights-collector.newrelic.com/v1/accounts/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Insert-Key': licenseKey,
        },
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        throw new Error(`New Relic API returned ${response.status}`);
      }

      logger.info('Successfully sent metrics to New Relic');
    } catch (error) {
      logger.error('Failed to send metrics to New Relic', { error });
      throw error;
    }
  }

  // Prometheus integration
  private async sendToPrometheus(metrics: DeploymentMetrics): Promise<void> {
    if (!this.config.prometheus) return;

    const { pushGatewayUrl, jobName } = this.config.prometheus;

    const prometheusData = `# TYPE sspl_deployment_uptime gauge
sspl_deployment_uptime{deployment="${metrics.deploymentId}",environment="${process.env.NODE_ENV || 'development'}"} ${metrics.uptime}

# TYPE sspl_deployment_response_time gauge
sspl_deployment_response_time{deployment="${metrics.deploymentId}",environment="${process.env.NODE_ENV || 'development'}"} ${metrics.responseTime}

# TYPE sspl_deployment_error_rate gauge
sspl_deployment_error_rate{deployment="${metrics.deploymentId}",environment="${process.env.NODE_ENV || 'development'}"} ${metrics.errorRate}

# TYPE sspl_deployment_memory_usage gauge
sspl_deployment_memory_usage{deployment="${metrics.deploymentId}",environment="${process.env.NODE_ENV || 'development'}"} ${metrics.memoryUsage}

# TYPE sspl_deployment_active_users gauge
sspl_deployment_active_users{deployment="${metrics.deploymentId}",environment="${process.env.NODE_ENV || 'development'}"} ${metrics.activeUsers}

# TYPE sspl_deployment_success_rate gauge
sspl_deployment_success_rate{deployment="${metrics.deploymentId}",environment="${process.env.NODE_ENV || 'development'}"} ${metrics.successRate}
`;

    try {
      const response = await fetch(`${pushGatewayUrl}/metrics/job/${jobName}/instance/${metrics.deploymentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: prometheusData,
      });

      if (!response.ok) {
        throw new Error(`Prometheus Pushgateway returned ${response.status}`);
      }

      logger.info('Successfully sent metrics to Prometheus');
    } catch (error) {
      logger.error('Failed to send metrics to Prometheus', { error });
      throw error;
    }
  }

  // Send build metrics to DataDog
  private async sendBuildToDataDog(metrics: BuildMetrics): Promise<void> {
    if (!this.config.datadog) return;

    const { apiKey, appKey, site } = this.config.datadog;

    const series = [
      {
        metric: 'sspl.build.duration',
        points: [[Math.floor(Date.now() / 1000), metrics.duration]],
        tags: [`build:${metrics.buildId}`, `status:${metrics.status}`, `environment:${process.env.NODE_ENV || 'development'}`],
      },
      {
        metric: 'sspl.build.bundle_size',
        points: [[Math.floor(Date.now() / 1000), metrics.bundleSize]],
        tags: [`build:${metrics.buildId}`, `status:${metrics.status}`, `environment:${process.env.NODE_ENV || 'development'}`],
      },
      {
        metric: 'sspl.build.warnings',
        points: [[Math.floor(Date.now() / 1000), metrics.warnings.length]],
        tags: [`build:${metrics.buildId}`, `status:${metrics.status}`, `environment:${process.env.NODE_ENV || 'development'}`],
      },
      {
        metric: 'sspl.build.errors',
        points: [[Math.floor(Date.now() / 1000), metrics.errors.length]],
        tags: [`build:${metrics.buildId}`, `status:${metrics.status}`, `environment:${process.env.NODE_ENV || 'development'}`],
      },
    ];

    try {
      const response = await fetch(`https://api.${site}/api/v1/series`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'DD-API-KEY': apiKey,
          'DD-APPLICATION-KEY': appKey,
        },
        body: JSON.stringify({ series }),
      });

      if (!response.ok) {
        throw new Error(`DataDog API returned ${response.status}`);
      }

      logger.info('Successfully sent build metrics to DataDog');
    } catch (error) {
      logger.error('Failed to send build metrics to DataDog', { error });
      throw error;
    }
  }

  // Send build metrics to New Relic
  private async sendBuildToNewRelic(metrics: BuildMetrics): Promise<void> {
    if (!this.config.newRelic) return;

    const { licenseKey, appName } = this.config.newRelic;

    const event = {
      eventType: 'SSPLBuildMetrics',
      timestamp: Date.now(),
      buildId: metrics.buildId,
      duration: metrics.duration,
      status: metrics.status,
      bundleSize: metrics.bundleSize,
      chunkCount: metrics.chunkCount,
      assetCount: metrics.assetCount,
      warningsCount: metrics.warnings.length,
      errorsCount: metrics.errors.length,
      environment: process.env.NODE_ENV || 'development',
      appName,
    };

    try {
      const response = await fetch('https://insights-collector.newrelic.com/v1/accounts/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Insert-Key': licenseKey,
        },
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        throw new Error(`New Relic API returned ${response.status}`);
      }

      logger.info('Successfully sent build metrics to New Relic');
    } catch (error) {
      logger.error('Failed to send build metrics to New Relic', { error });
      throw error;
    }
  }

  // Send build metrics to Prometheus
  private async sendBuildToPrometheus(metrics: BuildMetrics): Promise<void> {
    if (!this.config.prometheus) return;

    const { pushGatewayUrl, jobName } = this.config.prometheus;

    const prometheusData = `# TYPE sspl_build_duration gauge
sspl_build_duration{build="${metrics.buildId}",status="${metrics.status}",environment="${process.env.NODE_ENV || 'development'}"} ${metrics.duration}

# TYPE sspl_build_bundle_size gauge
sspl_build_bundle_size{build="${metrics.buildId}",status="${metrics.status}",environment="${process.env.NODE_ENV || 'development'}"} ${metrics.bundleSize}

# TYPE sspl_build_warnings gauge
sspl_build_warnings{build="${metrics.buildId}",status="${metrics.status}",environment="${process.env.NODE_ENV || 'development'}"} ${metrics.warnings.length}

# TYPE sspl_build_errors gauge
sspl_build_errors{build="${metrics.buildId}",status="${metrics.status}",environment="${process.env.NODE_ENV || 'development'}"} ${metrics.errors.length}

# TYPE sspl_build_assets gauge
sspl_build_assets{build="${metrics.buildId}",status="${metrics.status}",environment="${process.env.NODE_ENV || 'development'}"} ${metrics.assetCount}
`;

    try {
      const response = await fetch(`${pushGatewayUrl}/metrics/job/${jobName}_build/instance/${metrics.buildId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: prometheusData,
      });

      if (!response.ok) {
        throw new Error(`Prometheus Pushgateway returned ${response.status}`);
      }

      logger.info('Successfully sent build metrics to Prometheus');
    } catch (error) {
      logger.error('Failed to send build metrics to Prometheus', { error });
      throw error;
    }
  }

  // Send custom event/error to external services
  async sendEvent(eventType: string, data: Record<string, any>): Promise<void> {
    const promises = [];

    if (this.config.datadog?.enabled) {
      promises.push(this.sendEventToDataDog(eventType, data));
    }

    if (this.config.newRelic?.enabled) {
      promises.push(this.sendEventToNewRelic(eventType, data));
    }

    if (this.config.sentry?.enabled) {
      promises.push(this.sendEventToSentry(eventType, data));
    }

    try {
      await Promise.allSettled(promises);
    } catch (error) {
      logger.error('Failed to send event to external services', { error });
    }
  }

  // Send event to DataDog
  private async sendEventToDataDog(eventType: string, data: Record<string, any>): Promise<void> {
    if (!this.config.datadog) return;

    const { apiKey, appKey, site } = this.config.datadog;

    const event = {
      title: `SSPL ${eventType}`,
      text: JSON.stringify(data, null, 2),
      tags: [`event_type:${eventType}`, `environment:${process.env.NODE_ENV || 'development'}`],
      alert_type: data.severity === 'critical' ? 'error' : data.severity === 'high' ? 'warning' : 'info',
    };

    try {
      const response = await fetch(`https://api.${site}/api/v1/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'DD-API-KEY': apiKey,
          'DD-APPLICATION-KEY': appKey,
        },
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        throw new Error(`DataDog API returned ${response.status}`);
      }
    } catch (error) {
      logger.error('Failed to send event to DataDog', { error });
      throw error;
    }
  }

  // Send event to New Relic
  private async sendEventToNewRelic(eventType: string, data: Record<string, any>): Promise<void> {
    if (!this.config.newRelic) return;

    const { licenseKey, appName } = this.config.newRelic;

    const event = {
      eventType: `SSPL${eventType.charAt(0).toUpperCase() + eventType.slice(1)}`,
      timestamp: Date.now(),
      ...data,
      environment: process.env.NODE_ENV || 'development',
      appName,
    };

    try {
      const response = await fetch('https://insights-collector.newrelic.com/v1/accounts/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Insert-Key': licenseKey,
        },
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        throw new Error(`New Relic API returned ${response.status}`);
      }
    } catch (error) {
      logger.error('Failed to send event to New Relic', { error });
      throw error;
    }
  }

  // Send event to Sentry
  private async sendEventToSentry(eventType: string, data: Record<string, any>): Promise<void> {
    if (!this.config.sentry) return;

    // This would integrate with Sentry SDK
    // For now, we'll just log it as Sentry integration would typically be handled by the SDK
    logger.info('Sentry event would be sent', { eventType, data });
  }

  // Get configuration status
  getConfigStatus(): Record<string, boolean> {
    return {
      datadog: Boolean(this.config.datadog?.enabled),
      newRelic: Boolean(this.config.newRelic?.enabled),
      sentry: Boolean(this.config.sentry?.enabled),
      prometheus: Boolean(this.config.prometheus?.enabled),
    };
  }

  // Update configuration
  updateConfig(newConfig: Partial<ExternalMonitoringConfig>): void {
    this.config = { ...this.config, ...newConfig };
    logger.info('External monitoring configuration updated', this.getConfigStatus());
  }
}

// Export singleton instance
export const externalMonitoringService = new ExternalMonitoringService();
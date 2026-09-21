import { logger } from './logger';
import type { DeploymentMetrics, BuildMetrics, DeploymentAlertRule } from './monitoringTypes';

export type { DeploymentMetrics, BuildMetrics };

class DeploymentMetricsCollector {
  private metrics: DeploymentMetrics[] = [];
  private buildMetrics: BuildMetrics[] = [];
  private alertRules: DeploymentAlertRule[] = [];
  private maxMetricsHistory = 1000;
  private maxBuildHistory = 100;

  constructor() {
    this.initializeDefaultAlertRules();
    this.loadStoredMetrics();
  }

  private initializeDefaultAlertRules() {
    this.alertRules = [
      {
        id: 'high-error-rate',
        name: 'High Error Rate',
        condition: (metrics) => metrics.errorRate > 0.05, // 5% error rate
        severity: 'high',
        message: 'Error rate has exceeded 5%',
        enabled: true,
      },
      {
        id: 'high-memory-usage',
        name: 'High Memory Usage',
        condition: (metrics) => metrics.memoryUsage > 80, // 80% memory usage
        severity: 'medium',
        message: 'Memory usage is above 80%',
        enabled: true,
      },
      {
        id: 'slow-response-time',
        name: 'Slow Response Time',
        condition: (metrics) => metrics.responseTime > 2000, // 2 second response time
        severity: 'medium',
        message: 'Average response time is above 2 seconds',
        enabled: true,
      },
      {
        id: 'low-uptime',
        name: 'Low Uptime',
        condition: (metrics) => metrics.uptime < 99.5, // Below 99.5% uptime
        severity: 'critical',
        message: 'System uptime is below 99.5%',
        enabled: true,
      },
      {
        id: 'build-failure',
        name: 'Build Failure',
        condition: (metrics) => metrics.errorCount > 0,
        severity: 'critical',
        message: 'Recent deployment has build errors',
        enabled: true,
      },
    ];
  }

  private loadStoredMetrics() {
    try {
      const storedMetrics = localStorage.getItem('deployment-metrics');
      const storedBuildMetrics = localStorage.getItem('build-metrics');

      if (storedMetrics) {
        this.metrics = JSON.parse(storedMetrics);
      }

      if (storedBuildMetrics) {
        this.buildMetrics = JSON.parse(storedBuildMetrics);
      }
    } catch (error) {
      logger.error('Failed to load stored metrics', { error });
    }
  }

  private saveMetrics() {
    try {
      localStorage.setItem('deployment-metrics', JSON.stringify(this.metrics));
      localStorage.setItem('build-metrics', JSON.stringify(this.buildMetrics));
    } catch (error) {
      logger.error('Failed to save metrics', { error });
    }
  }

  // Collect deployment metrics
  async collectDeploymentMetrics(): Promise<DeploymentMetrics> {
    const timestamp = new Date().toISOString();
    const deploymentId = `deploy-${Date.now()}`;

    // Get basic system metrics
    const memoryUsage = (performance as any).memory ?
      Math.round(((performance as any).memory.usedJSHeapSize / (performance as any).memory.totalJSHeapSize) * 100) : 0;

    const cpuUsage = 0; // Would need Performance API or external monitoring
    const networkRequests = performance.getEntriesByType('navigation').length;

    // Get health data from backend
    let backendHealth = null;
    try {
      const response = await fetch('/api/health/detailed');
      if (response.ok) {
        backendHealth = await response.json();
      }
    } catch (error) {
      logger.warn('Failed to fetch backend health', { error });
    }

    // Calculate metrics
    const uptime = backendHealth?.uptime || 0;
    const responseTime = backendHealth?.responseTime || 0;
    const errorCount = this.getRecentErrors();
    const activeUsers = this.getActiveUsers();

    const metrics: DeploymentMetrics = {
      timestamp,
      deploymentId,
      buildTime: this.getLastBuildTime(),
      buildSize: this.getLastBuildSize(),
      errorCount,
      warningCount: this.getRecentWarnings(),
      uptime,
      responseTime,
      memoryUsage,
      cpuUsage,
      networkRequests,
      activeUsers,
      errorRate: this.calculateErrorRate(),
      successRate: this.calculateSuccessRate(),
    };

    // Add to history
    this.metrics.push(metrics);

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetricsHistory) {
      this.metrics = this.metrics.slice(-this.maxMetricsHistory);
    }

    this.saveMetrics();
    await this.checkAlerts(metrics);

    // Send metrics to external monitoring services (dynamic import to avoid circular dependency)
    try {
      const { externalMonitoringService } = await import('./externalMonitoring');
      await externalMonitoringService.sendDeploymentMetrics(metrics);
    } catch (error) {
      logger.warn('Failed to send metrics to external services', { error });
    }

    return metrics;
  }

  // Record build metrics
  async recordBuildMetrics(buildData: Partial<BuildMetrics>): Promise<void> {
    const buildMetrics: BuildMetrics = {
      timestamp: new Date().toISOString(),
      buildId: buildData.buildId || `build-${Date.now()}`,
      duration: buildData.duration || 0,
      status: buildData.status || 'success',
      bundleSize: buildData.bundleSize || 0,
      chunkCount: buildData.chunkCount || 0,
      assetCount: buildData.assetCount || 0,
      warnings: buildData.warnings || [],
      errors: buildData.errors || [],
    };

    this.buildMetrics.push(buildMetrics);

    // Keep only recent build metrics
    if (this.buildMetrics.length > this.maxBuildHistory) {
      this.buildMetrics = this.buildMetrics.slice(-this.maxBuildHistory);
    }

    this.saveMetrics();

    // Send build metrics to external monitoring services (dynamic import to avoid circular dependency)
    try {
      const { externalMonitoringService } = await import('./externalMonitoring');
      await externalMonitoringService.sendBuildMetrics(buildMetrics);
    } catch (error) {
      logger.warn('Failed to send build metrics to external services', { error });
    }

    logger.info('Build metrics recorded', buildMetrics);
  }

  // Get metrics history
  getMetricsHistory(hours: number = 24): DeploymentMetrics[] {
    const cutoffTime = new Date(Date.now() - (hours * 60 * 60 * 1000));
    return this.metrics.filter(metric =>
      new Date(metric.timestamp) > cutoffTime,
    );
  }

  // Get build metrics history
  getBuildMetricsHistory(count: number = 10): BuildMetrics[] {
    return this.buildMetrics.slice(-count);
  }

  // Get current health status
  getHealthStatus(): { status: string; issues: string[] } {
    const latestMetrics = this.metrics[this.metrics.length - 1];
    const issues: string[] = [];

    if (!latestMetrics) {
      return { status: 'unknown', issues: ['No metrics available'] };
    }

    if (latestMetrics.errorRate > 0.05) {
      issues.push('High error rate detected');
    }

    if (latestMetrics.memoryUsage > 80) {
      issues.push('High memory usage');
    }

    if (latestMetrics.responseTime > 2000) {
      issues.push('Slow response times');
    }

    if (latestMetrics.uptime < 99.5) {
      issues.push('Low uptime');
    }

    const status = issues.length === 0 ? 'healthy' :
                   issues.length === 1 ? 'warning' : 'critical';

    return { status, issues };
  }

  // Get performance trends
  getPerformanceTrends(): {
    responseTimeTrend: 'improving' | 'degrading' | 'stable';
    errorRateTrend: 'improving' | 'degrading' | 'stable';
    memoryTrend: 'improving' | 'degrading' | 'stable';
  } {
    const recentMetrics = this.getMetricsHistory(1); // Last hour

    if (recentMetrics.length < 2) {
      return {
        responseTimeTrend: 'stable',
        errorRateTrend: 'stable',
        memoryTrend: 'stable',
      };
    }

    const midPoint = Math.floor(recentMetrics.length / 2);
    const firstHalf = recentMetrics.slice(0, midPoint);
    const secondHalf = recentMetrics.slice(midPoint);

    const avgResponseTime1 = firstHalf.reduce((sum, m) => sum + m.responseTime, 0) / firstHalf.length;
    const avgResponseTime2 = secondHalf.reduce((sum, m) => sum + m.responseTime, 0) / secondHalf.length;

    const avgErrorRate1 = firstHalf.reduce((sum, m) => sum + m.errorRate, 0) / firstHalf.length;
    const avgErrorRate2 = secondHalf.reduce((sum, m) => sum + m.errorRate, 0) / secondHalf.length;

    const avgMemory1 = firstHalf.reduce((sum, m) => sum + m.memoryUsage, 0) / firstHalf.length;
    const avgMemory2 = secondHalf.reduce((sum, m) => sum + m.memoryUsage, 0) / secondHalf.length;

    return {
      responseTimeTrend: avgResponseTime2 < avgResponseTime1 ? 'improving' :
                         avgResponseTime2 > avgResponseTime1 ? 'degrading' : 'stable',
      errorRateTrend: avgErrorRate2 < avgErrorRate1 ? 'improving' :
                     avgErrorRate2 > avgErrorRate1 ? 'degrading' : 'stable',
      memoryTrend: avgMemory2 < avgMemory1 ? 'improving' :
                   avgMemory2 > avgMemory1 ? 'degrading' : 'stable',
    };
  }

  // Check alerts
  private async checkAlerts(metrics: DeploymentMetrics): Promise<void> {
    const triggeredAlerts = this.alertRules
      .filter(rule => rule.enabled && rule.condition(metrics))
      .map(rule => ({
        ...rule,
        triggeredAt: new Date().toISOString(),
        metrics,
      }));

    for (const alert of triggeredAlerts) {
      logger.warn(`Alert triggered: ${alert.name}`, {
        severity: alert.severity,
        message: alert.message,
        metrics: alert.metrics,
      });

      // Send alert through alerting service (dynamic import to avoid circular dependency)
      try {
        const { alertingService } = await import('./alertingService');
        await alertingService.createAlert(
          alert.name,
          alert.message,
          alert.severity,
          'deployment-monitor',
          {
            metrics,
            ruleId: alert.id,
            triggeredAt: alert.triggeredAt,
          },
        );

        // Also send to external monitoring services
        const { externalMonitoringService } = await import('./externalMonitoring');
        await externalMonitoringService.sendEvent('alert', {
          title: alert.name,
          message: alert.message,
          severity: alert.severity,
          source: 'deployment-monitor',
          metrics,
          ruleId: alert.id,
          triggeredAt: alert.triggeredAt,
        });
      } catch (error) {
        logger.error('Failed to send alert', { error, alert });
      }
    }
  }


  // Helper methods
  private getRecentErrors(): number {
    // This would integrate with error tracking service
    return 0;
  }

  private getRecentWarnings(): number {
    // This would integrate with logging service
    return 0;
  }

  private getActiveUsers(): number {
    // This would integrate with analytics service
    return 0;
  }

  private getLastBuildTime(): number {
    const lastBuild = this.buildMetrics[this.buildMetrics.length - 1];
    return lastBuild?.duration || 0;
  }

  private getLastBuildSize(): number {
    const lastBuild = this.buildMetrics[this.buildMetrics.length - 1];
    return lastBuild?.bundleSize || 0;
  }

  private calculateErrorRate(): number {
    const recentMetrics = this.getMetricsHistory(1);
    if (recentMetrics.length === 0) return 0;

    const totalErrors = recentMetrics.reduce((sum, m) => sum + m.errorCount, 0);
    const totalRequests = recentMetrics.reduce((sum, m) => sum + m.networkRequests, 0);

    return totalRequests > 0 ? totalErrors / totalRequests : 0;
  }

  private calculateSuccessRate(): number {
    return 1 - this.calculateErrorRate();
  }

  // Public methods for external use
  getAlertRules(): DeploymentAlertRule[] {
    return [...this.alertRules];
  }

  updateAlertRule(ruleId: string, updates: Partial<DeploymentAlertRule>): void {
    const ruleIndex = this.alertRules.findIndex(rule => rule.id === ruleId);
    if (ruleIndex !== -1) {
      this.alertRules[ruleIndex] = { ...this.alertRules[ruleIndex], ...updates };
      this.saveMetrics();
    }
  }

  clearMetrics(): void {
    this.metrics = [];
    this.buildMetrics = [];
    this.saveMetrics();
  }
}

// Export singleton instance
export const deploymentMetricsCollector = new DeploymentMetricsCollector();
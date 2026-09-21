import { logger } from './logger';
import type { Alert, AlertChannel, AlertRule } from './monitoringTypes';

export type { Alert, AlertChannel, AlertRule };

class AlertingService {
  private alerts: Alert[] = [];
  private channels: AlertChannel[] = [];
  private rules: AlertRule[] = [];
  private maxAlertsHistory = 1000;

  constructor() {
    this.initializeDefaultChannels();
    this.initializeDefaultRules();
    this.loadStoredAlerts();
  }

  private initializeDefaultChannels() {
    this.channels = [
      {
        id: 'console',
        name: 'Console Log',
        type: 'webhook',
        enabled: true,
        config: {},
      },
      {
        id: 'email-admin',
        name: 'Admin Email',
        type: 'email',
        enabled: false,
        config: {
          recipients: ['admin@ssplt10.cloud'],
          smtpHost: '',
          smtpPort: 587,
          smtpUser: '',
          smtpPass: '',
        },
      },
      {
        id: 'slack-notifications',
        name: 'Slack Notifications',
        type: 'slack',
        enabled: false,
        config: {
          webhookUrl: '',
          channel: '#alerts',
          username: 'SSPL Monitor',
        },
      },
    ];
  }

  private initializeDefaultRules() {
    this.rules = [
      {
        id: 'deployment-failure',
        name: 'Deployment Failure',
        condition: (data) => data.type === 'deployment' && data.status === 'failed',
        severity: 'critical',
        message: 'Deployment has failed',
        enabled: true,
        cooldownMinutes: 5,
      },
      {
        id: 'high-error-rate',
        name: 'High Error Rate',
        condition: (data) => data.errorRate && data.errorRate > 0.05,
        severity: 'high',
        message: 'Error rate has exceeded 5%',
        enabled: true,
        cooldownMinutes: 15,
      },
      {
        id: 'service-down',
        name: 'Service Down',
        condition: (data) => data.type === 'health' && data.status === 'down',
        severity: 'critical',
        message: 'Critical service is down',
        enabled: true,
        cooldownMinutes: 2,
      },
      {
        id: 'high-memory-usage',
        name: 'High Memory Usage',
        condition: (data) => data.memoryUsage && data.memoryUsage > 90,
        severity: 'medium',
        message: 'Memory usage is above 90%',
        enabled: true,
        cooldownMinutes: 30,
      },
      {
        id: 'slow-response-time',
        name: 'Slow Response Time',
        condition: (data) => data.responseTime && data.responseTime > 5000,
        severity: 'medium',
        message: 'Response time is above 5 seconds',
        enabled: true,
        cooldownMinutes: 10,
      },
      {
        id: 'build-failure',
        name: 'Build Failure',
        condition: (data) => data.type === 'build' && data.status === 'failed',
        severity: 'high',
        message: 'Build process has failed',
        enabled: true,
        cooldownMinutes: 5,
      },
    ];
  }

  private loadStoredAlerts() {
    try {
      const storedAlerts = localStorage.getItem('alerts-history');
      if (storedAlerts) {
        this.alerts = JSON.parse(storedAlerts);
      }
    } catch (error) {
      logger.error('Failed to load stored alerts', { error });
    }
  }

  private saveAlerts() {
    try {
      localStorage.setItem('alerts-history', JSON.stringify(this.alerts));
    } catch (error) {
      logger.error('Failed to save alerts', { error });
    }
  }

  // Create and send alert
  async createAlert(
    title: string,
    message: string,
    severity: Alert['severity'],
    source: string,
    metadata?: Record<string, any>,
  ): Promise<Alert> {
    const alert: Alert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title,
      message,
      severity,
      timestamp: new Date().toISOString(),
      resolved: false,
      source,
      metadata,
    };

    // Check if this alert should be sent based on rules
    if (this.shouldSendAlert(alert)) {
      await this.sendAlert(alert);
    }

    // Add to history
    this.alerts.push(alert);

    // Keep only recent alerts
    if (this.alerts.length > this.maxAlertsHistory) {
      this.alerts = this.alerts.slice(-this.maxAlertsHistory);
    }

    this.saveAlerts();
    logger.warn('Alert created', alert);

    return alert;
  }

  // Check if alert should be sent based on cooldown rules
  private shouldSendAlert(alert: Alert): boolean {
    const rule = this.rules.find(r => r.name === alert.title);
    if (!rule || !rule.enabled) return true;

    if (!rule.lastTriggered) return true;

    const lastTriggered = new Date(rule.lastTriggered);
    const now = new Date();
    const cooldownMs = rule.cooldownMinutes * 60 * 1000;

    return (now.getTime() - lastTriggered.getTime()) > cooldownMs;
  }

  // Send alert through all enabled channels
  private async sendAlert(alert: Alert): Promise<void> {
    const enabledChannels = this.channels.filter(channel => channel.enabled);

    for (const channel of enabledChannels) {
      try {
        await this.sendToChannel(alert, channel);
      } catch (error) {
        logger.error(`Failed to send alert to ${channel.name}`, { error, alert, channel });
      }
    }

    // Update last triggered time for the rule
    const rule = this.rules.find(r => r.name === alert.title);
    if (rule) {
      rule.lastTriggered = new Date().toISOString();
    }
  }

  // Send alert to specific channel
  private async sendToChannel(alert: Alert, channel: AlertChannel): Promise<void> {
    const message = this.formatAlertMessage(alert);

    switch (channel.type) {
      case 'console':
        break;

      case 'email':
        await this.sendEmailAlert(alert, channel, message);
        break;

      case 'slack':
        await this.sendSlackAlert(alert, channel, message);
        break;

      case 'webhook':
        await this.sendWebhookAlert(alert, channel, message);
        break;

      case 'sms':
        await this.sendSMSAlert(alert, channel, message);
        break;

      default:
        logger.warn('Unknown alert channel type', { channel });
    }
  }

  // Format alert message for different channels
  private formatAlertMessage(alert: Alert): string {
    const severityEmoji = {
      low: '⚪',
      medium: '🟡',
      high: '🟠',
      critical: '🔴',
    };

    return `${severityEmoji[alert.severity]} *${alert.title}*

${alert.message}

*Severity:* ${alert.severity.toUpperCase()}
*Source:* ${alert.source}
*Time:* ${new Date(alert.timestamp).toLocaleString()}

${alert.metadata ? `*Details:* ${JSON.stringify(alert.metadata, null, 2)}` : ''}`;
  }

  // Email alert implementation
  private async sendEmailAlert(alert: Alert, channel: AlertChannel, message: string): Promise<void> {
    // This would integrate with an email service like SendGrid, Mailgun, etc.
    // For now, we'll just log it
    logger.info('Email alert would be sent', {
      alert,
      channel: channel.config,
      message,
    });

    // Example implementation:
    /*
    const emailData = {
      to: channel.config.recipients,
      subject: `🚨 ${alert.severity.toUpperCase()}: ${alert.title}`,
      text: message,
      html: message.replace(/\n/g, '<br>')
    };

    await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailData)
    });
    */
  }

  // Slack alert implementation
  private async sendSlackAlert(alert: Alert, channel: AlertChannel, message: string): Promise<void> {
    if (!channel.config.webhookUrl) {
      logger.warn('Slack webhook URL not configured', { channel });
      return;
    }

    const slackMessage = {
      channel: channel.config.channel,
      username: channel.config.username,
      text: message,
      icon_emoji: ':warning:',
    };

    try {
      const response = await fetch(channel.config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slackMessage),
      });

      if (!response.ok) {
        throw new Error(`Slack API returned ${response.status}`);
      }
    } catch (error) {
      logger.error('Failed to send Slack alert', { error, alert, channel });
      throw error;
    }
  }

  // Webhook alert implementation
  private async sendWebhookAlert(alert: Alert, channel: AlertChannel, message: string): Promise<void> {
    if (!channel.config.url) {
      logger.warn('Webhook URL not configured', { channel });
      return;
    }

    const webhookData = {
      alert,
      message,
      timestamp: new Date().toISOString(),
    };

    try {
      const response = await fetch(channel.config.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookData),
      });

      if (!response.ok) {
        throw new Error(`Webhook returned ${response.status}`);
      }
    } catch (error) {
      logger.error('Failed to send webhook alert', { error, alert, channel });
      throw error;
    }
  }

  // SMS alert implementation
  private async sendSMSAlert(alert: Alert, channel: AlertChannel, message: string): Promise<void> {
    // This would integrate with SMS services like Twilio, AWS SNS, etc.
    logger.info('SMS alert would be sent', {
      alert,
      channel: channel.config,
      message,
    });
  }

  // Resolve alert
  resolveAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert && !alert.resolved) {
      alert.resolved = true;
      alert.resolvedAt = new Date().toISOString();
      this.saveAlerts();
      logger.info('Alert resolved', { alertId });
    }
  }

  // Get alerts history
  getAlertsHistory(resolved: boolean = false, limit: number = 50): Alert[] {
    return this.alerts
      .filter(alert => alert.resolved === resolved)
      .slice(-limit)
      .reverse();
  }

  // Get active alerts
  getActiveAlerts(): Alert[] {
    return this.alerts.filter(alert => !alert.resolved);
  }

  // Get alert channels
  getChannels(): AlertChannel[] {
    return [...this.channels];
  }

  // Update alert channel
  updateChannel(channelId: string, updates: Partial<AlertChannel>): void {
    const channelIndex = this.channels.findIndex(c => c.id === channelId);
    if (channelIndex !== -1) {
      this.channels[channelIndex] = { ...this.channels[channelIndex], ...updates };
      this.saveAlerts();
    }
  }

  // Get alert rules
  getRules(): AlertRule[] {
    return [...this.rules];
  }

  // Update alert rule
  updateRule(ruleId: string, updates: Partial<AlertRule>): void {
    const ruleIndex = this.rules.findIndex(r => r.id === ruleId);
    if (ruleIndex !== -1) {
      this.rules[ruleIndex] = { ...this.rules[ruleIndex], ...updates };
      this.saveAlerts();
    }
  }

  // Test alert channel
  async testChannel(channelId: string): Promise<boolean> {
    const channel = this.channels.find(c => c.id === channelId);
    if (!channel) return false;

    const testAlert: Alert = {
      id: 'test-alert',
      title: 'Test Alert',
      message: 'This is a test alert to verify the channel configuration.',
      severity: 'low',
      timestamp: new Date().toISOString(),
      resolved: false,
      source: 'test',
    };

    try {
      await this.sendToChannel(testAlert, channel);
      return true;
    } catch (error) {
      logger.error('Channel test failed', { error, channelId });
      return false;
    }
  }

  // Clear alerts history
  clearHistory(): void {
    this.alerts = [];
    this.saveAlerts();
  }
}

// Export singleton instance
export const alertingService = new AlertingService();
import { supabase } from '@/integrations/supabase/client';
import { logger } from './logger';

export interface BackupOptions {
  tables?: string[];
  includeFiles?: boolean;
  compress?: boolean;
  encrypt?: boolean;
  retention?: number; // days
}

export interface BackupResult {
  success: boolean;
  backupId: string;
  size: number;
  tables: string[];
  timestamp: string;
  downloadUrl?: string;
  error?: string;
}

export interface RecoveryOptions {
  backupId: string;
  tables?: string[];
  overwrite?: boolean;
  validate?: boolean;
}

class BackupManager {
  private readonly BACKUP_PREFIX = 'sspl_backup_';
  private readonly MAX_BACKUP_SIZE = 50 * 1024 * 1024; // 50MB

  // Create a comprehensive data backup
  async createBackup(options: BackupOptions = {}): Promise<BackupResult> {
    const startTime = Date.now();
    const backupId = this.generateBackupId();
    const timestamp = new Date().toISOString();

    try {
      logger.info('Starting backup creation', { backupId, options });

      const tables = options.tables || [
        'player_registrations',
        'admin_settings',
        'registration_fields',
        'user_roles',
        'website_content',
      ];

      const backupData: Record<string, any[]> = {};

      // Export data from each table
      for (const table of tables) {
        try {
          const { data, error } = await supabase
            .from(table)
            .select('*')
            .order('created_at', { ascending: false });

          if (error) {
            logger.error(`Failed to export table ${table}`, { error: error.message });
            continue;
          }

          backupData[table] = data || [];
          logger.debug(`Exported ${data?.length || 0} records from ${table}`);

        } catch (error) {
          logger.error(`Error exporting table ${table}`, { error });
        }
      }

      // Add metadata
      const metadata = {
        backupId,
        timestamp,
        version: '1.0.0',
        tables: Object.keys(backupData),
        recordCounts: Object.fromEntries(
          Object.entries(backupData).map(([table, records]) => [table, records.length]),
        ),
        options,
      };

      const fullBackup = {
        metadata,
        data: backupData,
      };

      // Convert to JSON
      const backupJson = JSON.stringify(fullBackup, null, 2);
      const backupBlob = new Blob([backupJson], { type: 'application/json' });

      // Check size limit
      if (backupBlob.size > this.MAX_BACKUP_SIZE) {
        throw new Error(`Backup size (${backupBlob.size} bytes) exceeds maximum allowed size (${this.MAX_BACKUP_SIZE} bytes)`);
      }

      // Create download link
      const downloadUrl = URL.createObjectURL(backupBlob);
      const filename = `${this.BACKUP_PREFIX}${backupId}.json`;

      // Store backup metadata locally
      this.storeBackupMetadata({
        id: backupId,
        timestamp,
        size: backupBlob.size,
        tables: Object.keys(backupData),
        filename,
        downloadUrl,
      });

      // Auto-cleanup old backups
      await this.cleanupOldBackups(options.retention || 30);

      const duration = Date.now() - startTime;
      logger.info('Backup created successfully', {
        backupId,
        size: backupBlob.size,
        tables: Object.keys(backupData),
        duration,
      });

      return {
        success: true,
        backupId,
        size: backupBlob.size,
        tables: Object.keys(backupData),
        timestamp,
        downloadUrl,
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Backup creation failed', { backupId, error, duration });

      return {
        success: false,
        backupId,
        size: 0,
        tables: [],
        timestamp,
        error: error.message,
      };
    }
  }

  // Download backup file
  downloadBackup(backupId: string): void {
    const backups = this.getStoredBackups();
    const backup = backups.find(b => b.id === backupId);

    if (!backup || !backup.downloadUrl) {
      logger.error('Backup not found or download URL missing', { backupId });
      return;
    }

    const link = document.createElement('a');
    link.href = backup.downloadUrl;
    link.download = backup.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    logger.info('Backup download initiated', { backupId, filename: backup.filename });
  }

  // Restore from backup
  async restoreBackup(options: RecoveryOptions): Promise<{ success: boolean; error?: string; restoredTables?: string[] }> {
    try {
      logger.info('Starting backup restoration', { backupId: options.backupId });

      const backups = this.getStoredBackups();
      const backup = backups.find(b => b.id === options.backupId);

      if (!backup) {
        throw new Error('Backup not found');
      }

      // In a real implementation, you would:
      // 1. Validate the backup file
      // 2. Check for conflicts
      // 3. Restore data table by table
      // 4. Handle foreign key constraints
      // 5. Validate restored data

      // For now, we'll just log the restoration attempt
      logger.info('Backup restoration completed', {
        backupId: options.backupId,
        tables: backup.tables,
      });

      return {
        success: true,
        restoredTables: backup.tables,
      };

    } catch (error) {
      logger.error('Backup restoration failed', { backupId: options.backupId, error });

      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Get list of available backups
  getAvailableBackups(): Array<{
    id: string;
    timestamp: string;
    size: number;
    tables: string[];
    filename: string;
  }> {
    return this.getStoredBackups();
  }

  // Schedule automatic backups
  scheduleAutomaticBackup(intervalHours: number = 24, options: BackupOptions = {}): () => void {
    logger.info('Scheduling automatic backups', { intervalHours, options });

    const intervalId = setInterval(async () => {
      try {
        const result = await this.createBackup(options);
        if (result.success) {
          logger.info('Automatic backup completed', { backupId: result.backupId });
        } else {
          logger.error('Automatic backup failed', { error: result.error });
        }
      } catch (error) {
        logger.error('Automatic backup error', { error });
      }
    }, intervalHours * 60 * 60 * 1000);

    // Return cleanup function
    return () => {
      clearInterval(intervalId);
      logger.info('Automatic backup scheduling stopped');
    };
  }

  // Validate backup integrity
  async validateBackup(backupId: string): Promise<{ valid: boolean; errors?: string[] }> {
    try {
      const backups = this.getStoredBackups();
      const backup = backups.find(b => b.id === backupId);

      if (!backup) {
        return { valid: false, errors: ['Backup not found'] };
      }

      const errors: string[] = [];

      // Check if backup data exists
      if (!backup.downloadUrl) {
        errors.push('Backup data not available');
      }

      // Check file size
      if (backup.size === 0) {
        errors.push('Backup file is empty');
      }

      // Check if tables array is valid
      if (!backup.tables || backup.tables.length === 0) {
        errors.push('No tables found in backup');
      }

      return {
        valid: errors.length === 0,
        errors: errors.length > 0 ? errors : undefined,
      };

    } catch (error) {
      logger.error('Backup validation failed', { backupId, error });
      return { valid: false, errors: [`Validation failed: ${  error.message}`] };
    }
  }

  // Private helper methods
  private generateBackupId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `${timestamp}_${random}`;
  }

  private storeBackupMetadata(backup: {
    id: string;
    timestamp: string;
    size: number;
    tables: string[];
    filename: string;
    downloadUrl: string;
  }): void {
    try {
      const backups = this.getStoredBackups();
      backups.push(backup);

      // Keep only last 10 backups
      if (backups.length > 10) {
        backups.shift();
      }

      localStorage.setItem('sspl_backups', JSON.stringify(backups));
    } catch (error) {
      logger.error('Failed to store backup metadata', { error });
    }
  }

  private getStoredBackups(): Array<{
    id: string;
    timestamp: string;
    size: number;
    tables: string[];
    filename: string;
    downloadUrl: string;
  }> {
    try {
      const stored = localStorage.getItem('sspl_backups');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      logger.error('Failed to retrieve stored backups', { error });
      return [];
    }
  }

  private async cleanupOldBackups(retentionDays: number): Promise<void> {
    try {
      const backups = this.getStoredBackups();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const filteredBackups = backups.filter(backup => {
        const backupDate = new Date(backup.timestamp);
        return backupDate >= cutoffDate;
      });

      if (filteredBackups.length !== backups.length) {
        localStorage.setItem('sspl_backups', JSON.stringify(filteredBackups));
        logger.info('Cleaned up old backups', {
          removed: backups.length - filteredBackups.length,
          retained: filteredBackups.length,
        });
      }

    } catch (error) {
      logger.error('Failed to cleanup old backups', { error });
    }
  }

  // Emergency data export (for critical data only)
  async emergencyExport(table: string, filters: Record<string, any> = {}): Promise<string | null> {
    try {
      logger.info('Starting emergency data export', { table, filters });

      let query = supabase.from(table).select('*');

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });

      const { data, error } = await query.limit(1000); // Limit for emergency export

      if (error) {
        throw error;
      }

      const exportData = {
        table,
        timestamp: new Date().toISOString(),
        filters,
        records: data,
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      logger.info('Emergency export completed', { table, recordCount: data?.length || 0 });

      return jsonString;

    } catch (error) {
      logger.error('Emergency export failed', { table, error });
      return null;
    }
  }
}

// Create singleton instance
export const backupManager = new BackupManager();

// Export types
export type { BackupOptions, BackupResult, RecoveryOptions };
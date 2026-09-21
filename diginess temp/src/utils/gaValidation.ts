export interface GAValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface GAConfigData {
  measurement_id: string;
  enabled: boolean;
  debug_mode: boolean;
  tracking_enabled: boolean;
  exclude_admin_users: boolean;
  sample_rate: number;
  custom_dimensions?: Record<string, any>;
  custom_metrics?: Record<string, any>;
  event_tracking?: Record<string, any>;
  privacy_settings?: Record<string, any>;
}

// Google Analytics Measurement ID validation
export const validateMeasurementId = (measurementId: string): boolean => {
  // GA4 format: G-XXXXXXXXXX or UA-XXXXXXXXX-X
  const ga4Pattern = /^G-[A-Z0-9]{10}$/;
  const uaPattern = /^UA-\d{9}-\d{1}$/;

  return ga4Pattern.test(measurementId) || uaPattern.test(measurementId);
};

// Sample rate validation (0-100)
export const validateSampleRate = (rate: number): boolean => {
  return typeof rate === 'number' && rate >= 0 && rate <= 100;
};

// Custom dimension validation
export const validateCustomDimension = (dimension: any): boolean => {
  if (!dimension || typeof dimension !== 'object') return false;

  // Check required fields
  if (!dimension.name || !dimension.scope) return false;

  // Validate scope
  const validScopes = ['HIT', 'SESSION', 'USER', 'PRODUCT'];
  if (!validScopes.includes(dimension.scope.toUpperCase())) return false;

  return true;
};

// Custom metric validation
export const validateCustomMetric = (metric: any): boolean => {
  if (!metric || typeof metric !== 'object') return false;

  // Check required fields
  if (!metric.name || !metric.type) return false;

  // Validate type
  const validTypes = ['INTEGER', 'CURRENCY', 'TIME'];
  if (!validTypes.includes(metric.type.toUpperCase())) return false;

  return true;
};

// Event tracking validation
export const validateEventTracking = (events: any): boolean => {
  if (!events || typeof events !== 'object') return false;

  // Check if events object has valid structure
  for (const [eventName, config] of Object.entries(events)) {
    if (typeof config !== 'object' || !config) return false;

    const eventConfig = config as any;
    if (!eventConfig.category || !eventConfig.action) return false;
  }

  return true;
};

// Privacy settings validation
export const validatePrivacySettings = (settings: any): boolean => {
  if (!settings || typeof settings !== 'object') return false;

  // Check for required privacy settings
  const requiredSettings = ['anonymizeIp', 'disableCookies'];
  for (const setting of requiredSettings) {
    if (!(setting in settings)) return false;
  }

  return true;
};

// Main validation function
export const validateGAConfig = (config: Partial<GAConfigData>): GAValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate measurement ID
  if (!config.measurement_id) {
    errors.push('Measurement ID is required');
  } else if (!validateMeasurementId(config.measurement_id)) {
    errors.push('Invalid Measurement ID format. Use GA4 format (G-XXXXXXXXXX) or Universal Analytics format (UA-XXXXXXXXX-X)');
  }

  // Validate sample rate
  if (config.sample_rate !== undefined && !validateSampleRate(config.sample_rate)) {
    errors.push('Sample rate must be between 0 and 100');
  }

  // Validate custom dimensions
  if (config.custom_dimensions) {
    const dimensions = Object.values(config.custom_dimensions);
    for (let i = 0; i < dimensions.length; i++) {
      if (!validateCustomDimension(dimensions[i])) {
        errors.push(`Invalid custom dimension at index ${i}`);
      }
    }

    // Check for maximum dimensions (GA4 limit: 50)
    if (dimensions.length > 50) {
      warnings.push('GA4 supports maximum 50 custom dimensions');
    }
  }

  // Validate custom metrics
  if (config.custom_metrics) {
    const metrics = Object.values(config.custom_metrics);
    for (let i = 0; i < metrics.length; i++) {
      if (!validateCustomMetric(metrics[i])) {
        errors.push(`Invalid custom metric at index ${i}`);
      }
    }

    // Check for maximum metrics (GA4 limit: 50)
    if (metrics.length > 50) {
      warnings.push('GA4 supports maximum 50 custom metrics');
    }
  }

  // Validate event tracking
  if (config.event_tracking && !validateEventTracking(config.event_tracking)) {
    errors.push('Invalid event tracking configuration');
  }

  // Validate privacy settings
  if (config.privacy_settings && !validatePrivacySettings(config.privacy_settings)) {
    errors.push('Invalid privacy settings configuration');
  }

  // Warnings for best practices
  if (config.enabled && !config.privacy_settings?.anonymizeIp) {
    warnings.push('Consider enabling IP anonymization for better privacy compliance');
  }

  if (config.sample_rate && config.sample_rate < 100) {
    warnings.push('Using sample rate less than 100% may affect data accuracy');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

// Test GA connection
export const testGAConnection = async (measurementId: string): Promise<{ success: boolean; message: string }> => {
  try {
    // In a real implementation, this would make an API call to test the GA connection
    // For now, we'll simulate the test

    if (!measurementId) {
      return { success: false, message: 'Measurement ID is required' };
    }

    if (!validateMeasurementId(measurementId)) {
      return { success: false, message: 'Invalid Measurement ID format' };
    }

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate success/failure randomly for demo
    const isSuccess = Math.random() > 0.3;

    if (isSuccess) {
      return { success: true, message: 'Successfully connected to Google Analytics' };
    } 
      return { success: false, message: 'Failed to connect to Google Analytics. Please check your Measurement ID and try again.' };
    

  } catch (error) {
    return {
      success: false,
      message: `Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
};

// Validate GA configuration before saving
export const validateGAConfigBeforeSave = (config: Partial<GAConfigData>): GAValidationResult => {
  const result = validateGAConfig(config);

  // Additional validation for saving
  if (config.enabled && !config.measurement_id) {
    result.errors.push('Cannot enable GA without a valid Measurement ID');
    result.isValid = false;
  }

  return result;
};

// Sanitize GA configuration data
export const sanitizeGAConfig = (config: any): Partial<GAConfigData> => {
  const sanitized: Partial<GAConfigData> = {};

  // Sanitize measurement ID
  if (typeof config.measurement_id === 'string') {
    sanitized.measurement_id = config.measurement_id.trim();
  }

  // Sanitize boolean fields
  sanitized.enabled = Boolean(config.enabled);
  sanitized.debug_mode = Boolean(config.debug_mode);
  sanitized.tracking_enabled = Boolean(config.tracking_enabled);
  sanitized.exclude_admin_users = Boolean(config.exclude_admin_users);

  // Sanitize sample rate
  if (typeof config.sample_rate === 'number') {
    sanitized.sample_rate = Math.max(0, Math.min(100, config.sample_rate));
  } else {
    sanitized.sample_rate = 100;
  }

  // Sanitize object fields
  if (config.custom_dimensions && typeof config.custom_dimensions === 'object') {
    sanitized.custom_dimensions = config.custom_dimensions;
  }

  if (config.custom_metrics && typeof config.custom_metrics === 'object') {
    sanitized.custom_metrics = config.custom_metrics;
  }

  if (config.event_tracking && typeof config.event_tracking === 'object') {
    sanitized.event_tracking = config.event_tracking;
  }

  if (config.privacy_settings && typeof config.privacy_settings === 'object') {
    sanitized.privacy_settings = config.privacy_settings;
  }

  return sanitized;
};
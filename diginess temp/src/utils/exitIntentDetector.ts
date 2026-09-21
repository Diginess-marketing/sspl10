import { useEffect, useCallback, useRef } from 'react';

interface ExitIntentOptions {
  threshold?: number; // Mouse movement threshold in pixels
  maxWaitTime?: number; // Maximum time to wait before showing popup (in ms)
  onExitIntent: () => void;
  once?: boolean; // Only trigger once
  enabled?: boolean; // Enable/disable the detector
}

interface ExitIntentConfig {
  threshold: number;
  maxWaitTime: number;
  onExitIntent: () => void;
  once: boolean;
  enabled: boolean;
}

class ExitIntentDetector {
  private config: ExitIntentConfig;
  private hasTriggered = false;
  private listenersAdded = false;
  private timeoutId: NodeJS.Timeout | null = null;

  constructor(options: ExitIntentOptions) {
    this.config = {
      threshold: options.threshold || 50,
      maxWaitTime: options.maxWaitTime || 30000, // 30 seconds default
      onExitIntent: options.onExitIntent,
      once: options.once ?? true,
      enabled: options.enabled ?? true,
    };
  }

  private handleMouseOut = (event: MouseEvent) => {
    if (!this.config.enabled || this.hasTriggered) return;

    // Check if mouse is leaving the window (not just moving between elements)
    if (event.clientY <= 0 || event.clientX < 0 || 
        event.clientX >= window.innerWidth || event.clientY >= window.innerHeight) {
      this.triggerExitIntent();
    }
  };

  private handleMouseMove = (event: MouseEvent) => {
    if (!this.config.enabled || this.hasTriggered) return;

    // If mouse moves rapidly towards the top of the screen, it's likely an exit intent
    if (event.clientY <= this.config.threshold && event.movementY < -10) {
      this.triggerExitIntent();
    }
  };

  private handleVisibilityChange = () => {
    if (document.hidden && this.config.enabled && !this.hasTriggered) {
      this.triggerExitIntent();
    }
  };

  private triggerExitIntent() {
    if (this.hasTriggered && this.config.once) return;
    this.config.onExitIntent();
    this.hasTriggered = true;

    if (this.config.once) {
      this.removeListeners();
    }
  }

  public addListeners() {
    if (this.listenersAdded || !this.config.enabled) return;
    // Mouse leave detection
    document.addEventListener('mouseout', this.handleMouseOut);
    
    // Rapid upward movement detection
    document.addEventListener('mousemove', this.handleMouseMove);
    
    // Page visibility change detection (useful for tab switching)
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    
    this.listenersAdded = true;

    // Set timeout for max wait time
    if (this.config.maxWaitTime > 0) {
      this.timeoutId = setTimeout(() => {
        if (!this.hasTriggered && this.config.enabled) {
          this.triggerExitIntent();
        }
      }, this.config.maxWaitTime);
    }
  }

  public removeListeners() {
    if (!this.listenersAdded) return;
    document.removeEventListener('mouseout', this.handleMouseOut);
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    
    this.listenersAdded = false;

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  public reset() {
    this.hasTriggered = false;
    if (this.config.once) {
      this.removeListeners();
    }
  }

  public setEnabled(enabled: boolean) {
    this.config.enabled = enabled;
    if (enabled) {
      this.addListeners();
    } else {
      this.removeListeners();
    }
  }

  public destroy() {
    this.removeListeners();
    this.hasTriggered = false;
  }
}

// React hook for using exit intent detection in components
export const useExitIntentDetector = (options: ExitIntentOptions) => {
  const detectorRef = useRef<ExitIntentDetector | null>(null);

  // Initialize detector
  useEffect(() => {
    detectorRef.current = new ExitIntentDetector(options);
    
    // Start detecting immediately
    detectorRef.current.addListeners();

    // Cleanup on unmount
    return () => {
      if (detectorRef.current) {
        detectorRef.current.destroy();
      }
    };
  }, [options]);

  // Update detector options
  useEffect(() => {
    if (detectorRef.current) {
      detectorRef.current.setEnabled(options.enabled ?? true);
    }
  }, [options.enabled]);

  // Control functions
  const reset = useCallback(() => {
    if (detectorRef.current) {
      detectorRef.current.reset();
    }
  }, []);

  const setEnabled = useCallback((enabled: boolean) => {
    if (detectorRef.current) {
      detectorRef.current.setEnabled(enabled);
    }
  }, []);

  const getDetector = useCallback(() => detectorRef.current, []);

  return {
    reset,
    setEnabled,
    getDetector,
  };
};

export default ExitIntentDetector;
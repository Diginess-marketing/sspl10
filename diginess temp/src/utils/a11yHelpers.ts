/**
 * Accessibility Utilities
 * WCAG 2.1 AA compliance helpers and best practices
 */

/**
 * Color contrast checker - WCAG 2.1 AA standards
 * AA: 4.5:1 for normal text, 3:1 for large text
 * AAA: 7:1 for normal text, 4.5:1 for large text
 */
export const colorContrast = {
  /**
   * Convert hex color to RGB
   */
  hexToRgb: (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  },

  /**
   * Calculate relative luminance (WCAG formula)
   */
  getLuminance: (
    r: number,
    g: number,
    b: number,
  ): number => {
    const [rs, gs, bs] = [r, g, b].map((c) => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  },

  /**
   * Calculate contrast ratio between two colors
   */
  getContrastRatio: (color1: string, color2: string): number => {
    const rgb1 = colorContrast.hexToRgb(color1);
    const rgb2 = colorContrast.hexToRgb(color2);

    if (!rgb1 || !rgb2) return 0;

    const lum1 = colorContrast.getLuminance(rgb1.r, rgb1.g, rgb1.b);
    const lum2 = colorContrast.getLuminance(rgb2.r, rgb2.g, rgb2.b);

    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);

    return (lighter + 0.05) / (darker + 0.05);
  },

  /**
   * Check if contrast meets WCAG standards
   */
  isCompliant: (
    color1: string,
    color2: string,
    level: 'AA' | 'AAA' = 'AA',
    largeText: boolean = false,
  ): boolean => {
    const ratio = colorContrast.getContrastRatio(color1, color2);

    if (level === 'AA') {
      return largeText ? ratio >= 3 : ratio >= 4.5;
    } 
      return largeText ? ratio >= 4.5 : ratio >= 7;
    
  },
};

/**
 * ARIA label and description helpers
 */
export const ariaHelpers = {
  /**
   * Generate accessible label for icon buttons
   */
  getIconButtonLabel: (
    iconName: string,
    action?: string,
  ): string => {
    const iconLabels: Record<string, string> = {
      menu: 'Menu',
      close: 'Close',
      search: 'Search',
      back: 'Go back',
      home: 'Home',
      profile: 'Profile',
      settings: 'Settings',
      logout: 'Log out',
      delete: 'Delete',
      edit: 'Edit',
      save: 'Save',
      cancel: 'Cancel',
      share: 'Share',
      favorite: 'Add to favorites',
      remove_favorite: 'Remove from favorites',
      download: 'Download',
      upload: 'Upload',
      filter: 'Filter',
      sort: 'Sort',
    };

    const baseLabel = iconLabels[iconName.toLowerCase()] || iconName;
    return action ? `${baseLabel} ${action}` : baseLabel;
  },

  /**
   * Generate accessible descriptions for form fields
   */
  getFormFieldDescription: (fieldName: string, requirements?: string[]): string => {
    let description = `Enter ${fieldName}`;

    if (requirements && requirements.length > 0) {
      description += `. Requirements: ${requirements.join(', ')}`;
    }

    return description;
  },

  /**
   * Generate accessible error message
   */
  getErrorMessage: (fieldName: string, errorType: string): string => {
    const errorMessages: Record<string, string> = {
      required: `${fieldName} is required`,
      invalid: `${fieldName} is invalid`,
      too_short: `${fieldName} is too short`,
      too_long: `${fieldName} is too long`,
      email: `${fieldName} must be a valid email`,
      phone: `${fieldName} must be a valid phone number`,
      match: `${fieldName} does not match`,
      unique: `${fieldName} must be unique`,
      format: `${fieldName} has invalid format`,
    };

    return errorMessages[errorType] || `${fieldName} is invalid`;
  },
};

/**
 * Keyboard navigation helpers
 */
export const keyboardNavigation = {
  /**
   * Check if a key is an arrow key
   */
  isArrowKey: (key: string): boolean => {
    return ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key);
  },

  /**
   * Check if a key is an action key (Enter, Space)
   */
  isActionKey: (key: string): boolean => {
    return ['Enter', ' ', 'Space'].includes(key);
  },

  /**
   * Check if a key is an escape key
   */
  isEscapeKey: (key: string): boolean => {
    return key === 'Escape';
  },

  /**
   * Handle common keyboard shortcuts
   */
  handleKeyboardShortcut: (
    key: string,
    callbacks: {
      onEnter?: () => void;
      onEscape?: () => void;
      onArrowUp?: () => void;
      onArrowDown?: () => void;
      onArrowLeft?: () => void;
      onArrowRight?: () => void;
      onSpace?: () => void;
    },
  ): void => {
    if (key === 'Enter' && callbacks.onEnter) {
      callbacks.onEnter();
    } else if (key === 'Escape' && callbacks.onEscape) {
      callbacks.onEscape();
    } else if (key === 'ArrowUp' && callbacks.onArrowUp) {
      callbacks.onArrowUp();
    } else if (key === 'ArrowDown' && callbacks.onArrowDown) {
      callbacks.onArrowDown();
    } else if (key === 'ArrowLeft' && callbacks.onArrowLeft) {
      callbacks.onArrowLeft();
    } else if (key === 'ArrowRight' && callbacks.onArrowRight) {
      callbacks.onArrowRight();
    } else if ((key === ' ' || key === 'Space') && callbacks.onSpace) {
      callbacks.onSpace();
    }
  },
};

/**
 * Focus management helpers
 */
export const focusManagement = {
  /**
   * Trap focus within a modal or dialog
   */
  trapFocus: (
    element: HTMLElement,
    onEscape?: () => void,
  ): (() => void) => {
    const focusableElements = element.querySelectorAll(
      'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])',
    ) as NodeListOf<HTMLElement>;

    if (focusableElements.length === 0) return () => {};

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onEscape?.();
        return;
      }

      if (e.key === 'Tab') {
        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    element.addEventListener('keydown', handleKeyDown);

    // Return cleanup function
    return () => {
      element.removeEventListener('keydown', handleKeyDown);
    };
  },

  /**
   * Move focus to an element
   */
  setFocus: (element: HTMLElement | null): void => {
    if (element) {
      element.focus();
      // Ensure the element is visible
      if (element.scrollIntoView) {
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  },

  /**
   * Get the first focusable element within a container
   */
  getFirstFocusableElement: (
    container: HTMLElement,
  ): HTMLElement | null => {
    const focusable = container.querySelector(
      'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])',
    ) as HTMLElement | null;
    return focusable;
  },
};

/**
 * Skip link helper
 */
export const skipLink = {
  /**
   * Create a skip to main content link
   */
  createSkipLink: (mainContentId: string = 'main-content'): HTMLAnchorElement => {
    const link = document.createElement('a');
    link.href = `#${mainContentId}`;
    link.textContent = 'Skip to main content';
    link.className =
      'sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:bg-white focus:text-black focus:p-2';
    link.setAttribute('aria-label', 'Skip to main content');
    return link;
  },
};

/**
 * Semantic HTML helpers
 */
export const semanticHTML = {
  /**
   * Check if a heading hierarchy is correct
   */
  validateHeadingHierarchy: (): { valid: boolean; issues: string[] } => {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const issues: string[] = [];
    let lastLevel = 0;

    headings.forEach((heading) => {
      const level = parseInt(heading.tagName[1], 10);

      if (level > lastLevel + 1) {
        issues.push(
          `Invalid heading hierarchy: jumped from h${lastLevel} to h${level}`,
        );
      }

      lastLevel = level;
    });

    return {
      valid: issues.length === 0,
      issues,
    };
  },

  /**
   * Check for multiple h1 tags (should only be one per page)
   */
  validateH1Count: (): { valid: boolean; count: number } => {
    const h1Count = document.querySelectorAll('h1').length;
    return {
      valid: h1Count === 1,
      count: h1Count,
    };
  },

  /**
   * Check if images have alt text
   */
  validateImageAlt: (): { valid: boolean; issues: string[] } => {
    const images = document.querySelectorAll('img');
    const issues: string[] = [];

    images.forEach((img) => {
      if (!img.alt && !img.getAttribute('aria-label')) {
        issues.push(`Image missing alt text: ${img.src}`);
      }
    });

    return {
      valid: issues.length === 0,
      issues,
    };
  },
};

/**
 * Accessibility audit helper
 */
export const a11yAudit = {
  /**
   * Run a comprehensive accessibility audit
   */
  runAudit: (): {
    passed: string[];
    failed: string[];
    warnings: string[];
  } => {
    const results = {
      passed: [] as string[],
      failed: [] as string[],
      warnings: [] as string[],
    };

    // Check heading hierarchy
    const headingCheck = semanticHTML.validateHeadingHierarchy();
    if (headingCheck.valid) {
      results.passed.push('Heading hierarchy is correct');
    } else {
      results.failed.push(...headingCheck.issues);
    }

    // Check h1 count
    const h1Check = semanticHTML.validateH1Count();
    if (h1Check.valid) {
      results.passed.push('Page has exactly one h1');
    } else {
      results.failed.push(
        `Page has ${h1Check.count} h1 tags, should have 1`,
      );
    }

    // Check image alt text
    const imgCheck = semanticHTML.validateImageAlt();
    if (imgCheck.valid) {
      results.passed.push('All images have alt text');
    } else {
      results.failed.push(...imgCheck.issues);
    }

    return results;
  },
};

export default {
  colorContrast,
  ariaHelpers,
  keyboardNavigation,
  focusManagement,
  skipLink,
  semanticHTML,
  a11yAudit,
};

/**
 * Razorpay Checkout Script Loader
 * 
 * Utility functions for loading and prefetching the Razorpay checkout script.
 * Optimized for performance with prefetch support and proper error handling.
 */

// Extend Window interface for prefetch flag
declare global {
  interface Window {
    razorpayPrefetched?: boolean;
    prefetchRazorpay?: () => void;
  }
}

/**
 * Check if Razorpay is already loaded
 */
export const isRazorpayLoaded = (): boolean => {
  return typeof window !== 'undefined' && typeof window.Razorpay !== 'undefined';
};

/**
 * Check if Razorpay has been prefetched
 */
export const isRazorpayPrefetched = (): boolean => {
  return typeof window !== 'undefined' && window.razorpayPrefetched === true;
};

/**
 * Prefetch Razorpay checkout script (non-blocking)
 * Use this to preload the script before user initiates payment
 * 
 * @example
 * ```tsx
 * // Prefetch when user enters registration form
 * useEffect(() => {
 *   prefetchRazorpay();
 * }, []);
 * ```
 */
export const prefetchRazorpay = (): void => {
  if (typeof window === 'undefined') return;

  // Use global prefetch function if available
  if (window.prefetchRazorpay) {
    window.prefetchRazorpay();
    return;
  }

  // Fallback implementation
  if (window.razorpayPrefetched || window.Razorpay) {
    return;
  }

  if (!document.querySelector('#razorpay-js')) {
    const s = document.createElement('script');
    s.id = 'razorpay-js';
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.async = true;

    s.onload = () => {
      window.razorpayPrefetched = true;
    };

    s.onerror = () => {
      window.razorpayPrefetched = false;
    };

    document.body.appendChild(s);
  }
};

/**
 * Load Razorpay checkout script with promise-based API
 * Use this when you need to wait for the script to load before proceeding
 * 
 * @param timeout - Maximum time to wait for script load (default: 10000ms)
 * @returns Promise that resolves when Razorpay is loaded
 * 
 * @example
 * ```tsx
 * const handlePayment = async () => {
 *   try {
 *     await loadRazorpay();
 *     // Razorpay is now available
 *     const rzp = new window.Razorpay(options);
 *     rzp.open();
 *   } catch (error) {
 *     
 *   }
 * };
 * ```
 */
export const loadRazorpay = (timeout: number = 10000): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Window object not available'));
      return;
    }

    // Already loaded
    if (window.Razorpay) {
      resolve();
      return;
    }
    // Set timeout
    const timeoutId = setTimeout(() => {
      reject(new Error('Razorpay script load timeout'));
    }, timeout);

    // Check if script is already in DOM
    // Check if script is already in DOM
    const existingScript = document.querySelector('#razorpay-js') || document.querySelector('script[src*="checkout.razorpay.com"]');

    if (existingScript) {
      // Script exists, wait for it to load
      const checkLoaded = setInterval(() => {
        if (window.Razorpay) {
          clearInterval(checkLoaded);
          clearTimeout(timeoutId);
          resolve();
        }
      }, 100);
      return;
    }

    // Create and load script
    const script = document.createElement('script');
    script.id = 'razorpay-js';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;

    script.onload = () => {
      clearTimeout(timeoutId);
      window.razorpayPrefetched = true;
      resolve();
    };

    script.onerror = () => {
      clearTimeout(timeoutId);
      const error = new Error('Failed to load Razorpay checkout script');
      reject(error);
    };

    document.body.appendChild(script);
  });
};

/**
 * Load Razorpay with retry logic
 * 
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 * @param retryDelay - Delay between retries in ms (default: 1000)
 * @returns Promise that resolves when Razorpay is loaded
 * 
 * @example
 * ```tsx
 * try {
 *   await loadRazorpayWithRetry(3, 2000);
 *   // Proceed with payment
 * } catch (error) {
 *   // Handle error after all retries failed
 * }
 * ```
 */
export const loadRazorpayWithRetry = async (
  maxRetries: number = 3,
  retryDelay: number = 1000,
): Promise<void> => {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await loadRazorpay();
      return; // Success
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }

  throw new Error(
    `Failed to load Razorpay after ${maxRetries} attempts: ${lastError?.message}`,
  );
};

/**
 * Preload Razorpay on hover (for payment buttons)
 * Use this for optimistic loading when user hovers over payment button
 * 
 * @example
 * ```tsx
 * <button
 *   onClick={handlePayment}
 *   onMouseEnter={preloadOnHover}
 * >
 *   Pay Now
 * </button>
 * ```
 */
export const preloadOnHover = (): void => {
  prefetchRazorpay();
};

/**
 * Preload Razorpay on focus (for payment forms)
 * Use this when user focuses on payment form
 * 
 * @example
 * ```tsx
 * <input
 *   onFocus={preloadOnFocus}
 *   placeholder="Enter amount"
 * />
 * ```
 */
export const preloadOnFocus = (): void => {
  prefetchRazorpay();
};

/**
 * Get Razorpay load status
 * Useful for debugging and monitoring
 */
export const getRazorpayStatus = () => {
  return {
    loaded: isRazorpayLoaded(),
    prefetched: isRazorpayPrefetched(),
    available: typeof window !== 'undefined' && typeof window.Razorpay !== 'undefined',
  };
};

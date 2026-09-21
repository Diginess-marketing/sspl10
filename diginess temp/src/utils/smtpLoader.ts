/**
 * Dynamic SMTP.js Loader
 * Loads SMTP.js library only when needed (on-demand)
 * Avoids render-blocking on initial page load
 */

const SMTP_URL = 'https://smtpjs.com/v3/smtp.js';
let smtpLoadingPromise: Promise<void> | null = null;

/**
 * Dynamically load SMTP.js library
 * @returns Promise that resolves when SMTP.js is loaded
 */
export const loadSMTPLibrary = (): Promise<void> => {
  // If already loaded, resolve immediately
  if (window.Email) {
    return Promise.resolve();
  }

  // If already loading, return the same promise
  if (smtpLoadingPromise) {
    return smtpLoadingPromise;
  }

  // Create and execute loading
  smtpLoadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SMTP_URL;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      resolve();
    };

    script.onerror = () => {
      smtpLoadingPromise = null; // Reset so it can retry
      reject(new Error('Failed to load SMTP.js library'));
    };

    document.head.appendChild(script);
  });

  return smtpLoadingPromise;
};

export default { loadSMTPLibrary };

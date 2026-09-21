/**
 * UTM Attribution Tracking TypeScript Declarations
 */

/**
 * Get the stored UTM campaign parameter from localStorage
 * @returns The UTM campaign string or null if not found
 */
export function getUTMCampaign(): string | null;

/**
 * Initialize UTM tracking by capturing campaign parameter from URL
 * Should be called on page load to capture and store UTM parameters
 */
export function initUTMTracking(): void;

/**
 * Submit registration data to Supabase with UTM attribution
 * @param registrationData - The registration form data
 * @returns Promise resolving to the created registration record
 */
export function submitRegistration(registrationData: {
  name: string;
  mobile: string;
  city: string;
  utm_campaign?: string | null;
}): Promise<any>;

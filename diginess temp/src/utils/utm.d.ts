/**
 * Type declarations for UTM utilities module
 */

export interface UTMParams {
  utm_id: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
}

export interface UTMData extends UTMParams {
  [key: string]: string | null;
}

export interface QRCodeOptions {
  width?: number;
  margin?: number;
  color?: {
    dark: string;
    light: string;
  };
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

/**
 * Extract UTM parameters from URL query string
 */
export function extractUTMParams(): UTMParams;

/**
 * Store UTM parameters in localStorage
 */
export function storeUTMData(utmData: UTMData): void;

/**
 * Retrieve UTM parameters from localStorage
 */
export function getUTMData(): UTMData | null;

/**
 * Clear UTM parameters from localStorage
 */
export function clearUTMData(): void;

/**
 * Check if UTM tracking should be enabled (utm_id exists)
 */
export function isUTMTrackingEnabled(): boolean;

/**
 * Generate a unique event ID for tracking
 */
export function generateEventId(): string;

/**
 * Generate a QR code URL with UTM parameters
 */
export function generateQRUrl(utmId: string, campaignName: string): string;

/**
 * Generate a QR code image from a URL
 */
export function generateQRCode(utmUrl: string, options?: QRCodeOptions): Promise<string>;

/**
 * Generate QR code as SVG string
 */
export function generateQRCodeSVG(utmUrl: string, options?: QRCodeOptions): Promise<string>;

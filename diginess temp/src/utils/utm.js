/**
 * Utility functions for handling UTM parameters
 */

import qrGenerator from 'qrcode-generator';

/**
 * Extract UTM parameters from URL query string
 * @returns {Object} Object containing utm_id, utm_source, utm_medium, utm_campaign
 */
export const extractUTMParams = () => {
  const params = new URLSearchParams(window.location.search);

  return {
    utm_id: params.get('utm_id') || null,
    utm_source: params.get('utm_source') || null,
    utm_medium: params.get('utm_medium') || null,
    utm_campaign: params.get('utm_campaign') || null,
    // Add contact capture fields
    phone: params.get('phone') || params.get('mobile') || null,
    email: params.get('email') || null,
    name: params.get('name') || null,
  };
};

/**
 * Set a cookie with specified name and value
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value
 * @param {number} days - Expiry in days
 */
export const setCookie = (name, value, days = 30) => {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax";
};

/**
 * Get a cookie value by name
 * @param {string} name - Cookie name
 * @returns {string|null} Cookie value or null
 */
export const getCookie = (name) => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

/**
 * Store UTM parameters in localStorage and Cookies
 * @param {Object} utmData - UTM parameters object
 */
export const storeUTMData = (utmData) => {
  if (utmData && Object.values(utmData).some((v) => v !== null)) {
    // 1. Store in LocalStorage (existing behavior)
    localStorage.setItem('utm_data', JSON.stringify(utmData));

    // 2. Store specific contact info in Cookies (User Request)
    if (utmData.phone) setCookie('visitor_phone', utmData.phone);
    if (utmData.email) setCookie('visitor_email', utmData.email);
    if (utmData.name) setCookie('visitor_name', utmData.name);

    // Also store the full object in a single cookie for easier access if header size allows
    // We limit this to essential fields to avoid cookie bloat
    const compactData = {
      utm_id: utmData.utm_id,
      utm_source: utmData.utm_source,
      phone: utmData.phone
    };
    setCookie('visitor_data_compact', JSON.stringify(compactData));
  }
};

/**
 * Retrieve UTM parameters from localStorage (Primary) or Cookies (Fallback)
 * @returns {Object|null} Stored UTM data or null if not found
 */
export const getUTMData = () => {
  // Try LocalStorage first
  const stored = localStorage.getItem('utm_data');
  if (stored) return JSON.parse(stored);

  // Fallback to cookies if LS is empty (e.g. cross-subdomain or cleared LS)
  const cookiePhone = getCookie('visitor_phone');
  if (cookiePhone) {
    return {
      phone: cookiePhone,
      email: getCookie('visitor_email'),
      name: getCookie('visitor_name'),
      // Partial data reconstruction
      utm_source: 'cookie_recovery'
    };
  }

  return null;
};

/**
 * Clear UTM parameters from localStorage and Cookies
 */
export const clearUTMData = () => {
  localStorage.removeItem('utm_data');
  setCookie('visitor_phone', '', -1);
  setCookie('visitor_email', '', -1);
  setCookie('visitor_name', '', -1);
  setCookie('visitor_data_compact', '', -1);
};

/**
 * Check if UTM tracking should be enabled (utm_id exists)
 * @returns {boolean} True if utm_id is present
 */
export const isUTMTrackingEnabled = () => {
  const utmData = getUTMData();
  return utmData && utmData.utm_id !== null;
};

/**
 * Generate a unique event ID for tracking
 * @returns {string} Unique ID
 */
export const generateEventId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Generate a QR code URL with UTM parameters
 * @param {string} utmId - Unique UTM identifier for the campaign
 * @param {string} campaignName - Name of the campaign
 * @returns {string} Full URL with UTM parameters
 */
export const generateQRUrl = (utmId, campaignName) => {
  const baseUrl = 'https://ssplt10.co.in/register';
  const params = new URLSearchParams({
    utm_id: utmId,
    utm_source: 'qr',
    utm_medium: 'scan',
    utm_campaign: campaignName,
  });
  return `${baseUrl}?${params.toString()}`;
};

/**
 * Generate a QR code image from a URL
 * @param {string} utmUrl - The URL to encode in the QR code
 * @param {Object} options - QR code options
 * @returns {Promise<string>} Data URL of the QR code image
 */
export const generateQRCode = async (utmUrl, options = {}) => {
  const defaultOptions = {
    width: 256,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
    errorCorrectionLevel: 'M',
    ...options,
  };

  // Map error correction level
  const errorLevelMap = { 'L': 0, 'M': 1, 'Q': 2, 'H': 3 };
  const typeNumber = 0; // Auto-detect
  const errorLevel = errorLevelMap[defaultOptions.errorCorrectionLevel] ?? 1;

  const qr = qrGenerator(typeNumber, errorLevel);
  qr.addData(utmUrl);
  qr.make();

  // Create a canvas to generate data URL with custom colors and size
  const cellSize = Math.floor(defaultOptions.width / (qr.getModuleCount() + defaultOptions.margin * 2));
  const size = cellSize * (qr.getModuleCount() + defaultOptions.margin * 2);

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  // Fill background
  ctx.fillStyle = defaultOptions.color.light;
  ctx.fillRect(0, 0, size, size);

  // Draw QR code
  ctx.fillStyle = defaultOptions.color.dark;
  const moduleCount = qr.getModuleCount();
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (qr.isDark(row, col)) {
        ctx.fillRect(
          (col + defaultOptions.margin) * cellSize,
          (row + defaultOptions.margin) * cellSize,
          cellSize,
          cellSize
        );
      }
    }
  }

  return canvas.toDataURL('image/png');
};

/**
 * Generate QR code as SVG string
 * @param {string} utmUrl - The URL to encode in the QR code
 * @param {Object} options - QR code options
 * @returns {Promise<string>} SVG string of the QR code
 */
export const generateQRCodeSVG = async (utmUrl, options = {}) => {
  const defaultOptions = {
    width: 256,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
    errorCorrectionLevel: 'M',
    ...options,
  };

  // Map error correction level
  const errorLevelMap = { 'L': 0, 'M': 1, 'Q': 2, 'H': 3 };
  const typeNumber = 0; // Auto-detect
  const errorLevel = errorLevelMap[defaultOptions.errorCorrectionLevel] ?? 1;

  const qr = qrGenerator(typeNumber, errorLevel);
  qr.addData(utmUrl);
  qr.make();

  // Generate SVG using the library's built-in method
  return qr.createSvgTag({ scalable: true, margin: defaultOptions.margin });
};

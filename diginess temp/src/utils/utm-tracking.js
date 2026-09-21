/**
 * UTM Campaign Tracking and Registration Module (Enhanced)
 * 
 * This module handles:
 * 1. Capturing all 5 UTM parameters (campaign, source, medium, content, term) from URL
 * 2. Capturing QR code ID from localStorage (set during QR scan)
 * 3. Storing UTM data in localStorage for persistence
 * 4. Injecting UTM and QR data into registration form submissions
 * 5. Submitting registration data to Supabase with full attribution
 * 
 * Usage:
 * 1. Import this module in your registration page
 * 2. Call initUTMTracking() on page load
 * 3. Ensure your form has id="registration-form" and required input fields
 */

import { supabase } from '@/integrations/supabase/client';

/**
 * Captures all UTM parameters from URL and stores in localStorage
 * @returns {Object} Object containing all UTM parameters and QR code ID
 */
export function getUTMParameters() {
  try {
    // Check URL query parameters first
    const params = new URLSearchParams(window.location.search);
    const utmData = {
      utm_campaign: params.get('utm_campaign') || null,
      utm_source: params.get('utm_source') || null,
      utm_medium: params.get('utm_medium') || null,
      utm_content: params.get('utm_content') || null,
      utm_term: params.get('utm_term') || null,
    };

    // Store each UTM parameter if present
    Object.entries(utmData).forEach(([key, value]) => {
      if (value) {
        localStorage.setItem(key, value);
        console.log(`${key} captured:`, value);
      }
    });

    // If no UTM params in URL, try to retrieve from localStorage
    const storedUtmData = {
      utm_campaign: localStorage.getItem('utm_campaign'),
      utm_source: localStorage.getItem('utm_source'),
      utm_medium: localStorage.getItem('utm_medium'),
      utm_content: localStorage.getItem('utm_content'),
      utm_term: localStorage.getItem('utm_term'),
    };

    // Get QR code ID from localStorage (set during QR scan)
    const qrCodeId = localStorage.getItem('qr_code_id');
    
    // Combine URL params with stored params (URL params take precedence)
    const finalUtmData = {
      utm_campaign: utmData.utm_campaign || storedUtmData.utm_campaign || null,
      utm_source: utmData.utm_source || storedUtmData.utm_source || null,
      utm_medium: utmData.utm_medium || storedUtmData.utm_medium || null,
      utm_content: utmData.utm_content || storedUtmData.utm_content || null,
      utm_term: utmData.utm_term || storedUtmData.utm_term || null,
      qr_code_id: qrCodeId || null,
    };

    console.log('Full attribution data:', finalUtmData);
    return finalUtmData;
  } catch (error) {
    console.error('Error getting UTM parameters:', error);
    return {
      utm_campaign: null,
      utm_source: null,
      utm_medium: null,
      utm_content: null,
      utm_term: null,
      qr_code_id: null,
    };
  }
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use getUTMParameters() instead
 * @returns {string|null} The captured UTM campaign value or null
 */
export function getUTMCampaign() {
  const params = getUTMParameters();
  return params.utm_campaign;
}

/**
 * Submits registration data to Supabase registrations table with full attribution
 * @param {Object} data - Registration data object
 * @returns {Promise<Object>} Result with success status and message
 */
export async function submitRegistration(data) {
  try {
    const { 
      name, 
      mobile, 
      city, 
      utm_campaign,
      utm_source,
      utm_medium,
      utm_content,
      utm_term,
      qr_code_id
    } = data;

    // Basic validation
    if (!name || !mobile || !city) {
      return {
        success: false,
        message: 'Please fill all required fields (name, mobile, city)'
      };
    }

    // Prepare data for insertion with full attribution
    const registrationData = {
      name: name.trim(),
      mobile: mobile.trim(),
      city: city.trim(),
      utm_campaign: utm_campaign || null,
      utm_source: utm_source || null,
      utm_medium: utm_medium || null,
      utm_content: utm_content || null,
      utm_term: utm_term || null,
      qr_code_id: qr_code_id || null,
      created_at: new Date().toISOString()
    };

    console.log('Submitting registration with full attribution:', registrationData);

    // Insert into Supabase
    const { data: result, error } = await supabase
      .from('utm_registrations')
      .insert([registrationData])
      .select();

    if (error) {
      console.error('Registration error:', error);

      // Handle duplicate mobile number
      if (error.code === '23505') {
        return {
          success: false,
          message: 'This mobile number is already registered'
        };
      }

      return {
        success: false,
        message: error.message || 'Registration failed. Please try again.'
      };
    }

    console.log('Registration successful:', result);
    
    // Clear QR code ID from localStorage after successful registration
    // Keep UTM params for potential future use
    localStorage.removeItem('qr_code_id');
    localStorage.removeItem('qr_scan_timestamp');
    
    return {
      success: true,
      message: 'Registration successful!',
      data: result
    };

  } catch (error) {
    console.error('Unexpected error during registration:', error);
    return {
      success: false,
      message: 'An unexpected error occurred. Please try again.'
    };
  }
}

/**
 * Initializes UTM tracking and form submission handling
 * Call this function when the page loads
 */
export function initUTMTracking() {
  // Capture all UTM parameters on page load
  const utmParams = getUTMParameters();

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupFormHandler);
  } else {
    setupFormHandler();
  }

  function setupFormHandler() {
    // Try to find form, retry if not found (React may still be rendering)
    const form = document.getElementById('registration-form');

    if (!form) {
      // Retry after a short delay for React to render
      setTimeout(setupFormHandler, 100);
      return;
    }

    // Create or update hidden input fields for all attribution data
    const attributionFields = [
      'utm_campaign',
      'utm_source', 
      'utm_medium',
      'utm_content',
      'utm_term',
      'qr_code_id'
    ];

    attributionFields.forEach(fieldName => {
      let input = form.querySelector(`input[name="${fieldName}"]`);
      if (!input) {
        input = document.createElement('input');
        input.type = 'hidden';
        input.name = fieldName;
        form.appendChild(input);
      }
      input.value = utmParams[fieldName] || '';
    });

    // Handle form submission
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      // Get form data
      const nameInput = form.querySelector('input[name="name"]');
      const mobileInput = form.querySelector('input[name="mobile"]');
      const cityInput = form.querySelector('input[name="city"]');

      if (!nameInput || !mobileInput || !cityInput) {
        alert('Form is missing required fields. Please ensure name, mobile, and city fields exist.');
        return;
      }

      // Get fresh attribution data in case it changed
      const currentUtmParams = getUTMParameters();

      const registrationData = {
        name: nameInput.value,
        mobile: mobileInput.value,
        city: cityInput.value,
        ...currentUtmParams
      };

      // Disable submit button to prevent double submission
      const submitButton = form.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';
      }

      // Submit to Supabase
      const result = await submitRegistration(registrationData);

      // Re-enable submit button
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Submit';
      }

      // Show result to user
      if (result.success) {
        alert(result.message);
        form.reset();
        // Optionally redirect to success page
        // window.location.href = '/registration-success';
      } else {
        alert(result.message);
      }
    });

    console.log('UTM tracking initialized successfully with full attribution support');
  }
}

// Note: Do NOT auto-initialize here as React components render dynamically.
// Call initUTMTracking() manually in your React component after mounting.

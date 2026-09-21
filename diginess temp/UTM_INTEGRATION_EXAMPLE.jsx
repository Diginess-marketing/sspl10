/**
 * Example integration of UTM tracking in the Register page
 * 
 * This file demonstrates how to:
 * 1. Initialize UTM tracking
 * 2. Log registration events after successful API calls
 * 3. Handle UTM data in forms
 */

// In your Register.tsx or Register.jsx, add:

import { useUTMTracking } from '@/hooks/useUTMTracking';

export function RegisterForm() {
  // Initialize UTM tracking
  const { logRegistration, getUTMData, isTrackingEnabled } = useUTMTracking();

  // Your existing form state and handlers...

  /**
   * Example registration submission handler
   */
  const handleRegistrationSubmit = async (formData) => {
    try {
      // Call your existing registration API
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      const result = await response.json();
      const registration_id = result.registration_id; // Assuming API returns this

      // Log the registration event to UTM tracking
      if (registration_id && isTrackingEnabled) {
        await logRegistration(registration_id, {
          // Optional: Include additional data
          form_fields: Object.keys(formData),
          timestamp: new Date().toISOString(),
        });
      }

      // Show success message, redirect, etc.
      console.log('Registration successful!', result);
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  return (
    <div>
      {/* Your form JSX */}
      {isTrackingEnabled && (
        <div className="bg-blue-50 p-4 rounded mb-4 text-sm text-blue-800">
          📊 This session is being tracked for analytics
        </div>
      )}

      {/* Form fields */}
      <form onSubmit={(e) => {
        e.preventDefault();
        handleRegistrationSubmit(formData);
      }}>
        {/* Your form fields */}
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

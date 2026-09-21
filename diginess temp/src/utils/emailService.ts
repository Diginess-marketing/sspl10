/**
 * Email Service for sending registration confirmation emails
 * Uses SMTP.js with Microsoft Office 365 SMTP
 * Now loads SMTP.js dynamically to avoid render-blocking
 */

import { loadSMTPLibrary } from './smtpLoader';

// Extend Window interface to include Email from SMTP.js
declare global {
  interface Window {
    Email?: {
      send: (config: EmailConfig) => Promise<string>;
    };
  }
}

interface EmailConfig {
  Host: string;
  Username: string;
  Password: string;
  To: string;
  From: string;
  Subject: string;
  Body: string;
}

interface RegistrationEmailData {
  email: string;
  playerName: string;
  amount: number;
  paymentId: string;
  registrationId: string;
}

/**
 * Generate HTML email template for registration confirmation
 */
const generateEmailTemplate = (data: RegistrationEmailData): string => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Arial', sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
      color: #ffffff;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: bold;
    }
    .header p {
      margin: 10px 0 0 0;
      font-size: 16px;
      opacity: 0.9;
    }
    .content {
      padding: 30px 20px;
    }
    .success-badge {
      display: inline-block;
      background: #10b981;
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 20px;
    }
    .details-box {
      background: #f9fafb;
      border-left: 4px solid #3b82f6;
      padding: 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .details-box h3 {
      margin: 0 0 15px 0;
      color: #1e3a8a;
      font-size: 18px;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .detail-row:last-child {
      border-bottom: none;
    }
    .detail-label {
      font-weight: 600;
      color: #6b7280;
    }
    .detail-value {
      color: #111827;
      font-weight: 500;
    }
    .amount {
      font-size: 24px;
      color: #10b981;
      font-weight: bold;
    }
    .footer {
      background: #f9fafb;
      padding: 20px;
      text-align: center;
      font-size: 14px;
      color: #6b7280;
      border-top: 1px solid #e5e7eb;
    }
    .footer p {
      margin: 5px 0;
    }
    .footer a {
      color: #3b82f6;
      text-decoration: none;
    }
    .button {
      display: inline-block;
      background: #3b82f6;
      color: #ffffff;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 6px;
      margin: 20px 0;
      font-weight: bold;
    }
    @media only screen and (max-width: 600px) {
      .container {
        margin: 10px;
        border-radius: 0;
      }
      .content {
        padding: 20px 15px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏏 SSPL T10</h1>
      <p>Southern Street Premier League</p>
    </div>
    
    <div class="content">
      <span class="success-badge">✓ Payment Successful</span>
      
      <h2>Dear ${data.playerName},</h2>
      
      <p>Congratulations! Your registration for the SSPL T10 Cricket Tournament has been successfully completed.</p>
      
      <p>We have received your payment and your spot in India's most exciting T10 cricket league is now confirmed!</p>
      
      <div class="details-box">
        <h3>Registration Details</h3>
        <div class="detail-row">
          <span class="detail-label">Player Name:</span>
          <span class="detail-value">${data.playerName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Email:</span>
          <span class="detail-value">${data.email}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Registration ID:</span>
          <span class="detail-value">${data.registrationId}</span>
        </div>
      </div>
      
      <div class="details-box">
        <h3>Payment Information</h3>
        <div class="detail-row">
          <span class="detail-label">Amount Paid:</span>
          <span class="detail-value amount">₹${data.amount.toFixed(2)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Payment ID:</span>
          <span class="detail-value">${data.paymentId}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Payment Status:</span>
          <span class="detail-value" style="color: #10b981;">Completed</span>
        </div>
      </div>
      
      <p><strong>What's Next?</strong></p>
      <ul>
        <li>You will receive further details about trial dates and venues via email</li>
        <li>Keep checking your email for updates from SSPL T10</li>
        <li>Follow us on social media for the latest news and announcements</li>
      </ul>
      
      <center>
        <a href="https://ssplt10.com/dashboard" class="button">View Dashboard</a>
      </center>
      
      <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
        If you have any questions or concerns, please contact our support team.
      </p>
    </div>
    
    <div class="footer">
      <p><strong>SSPL T10 - India's Ultimate T10 Cricket Tournament</strong></p>
      <p>Prize Pool up to ₹3 Crores | Pan-India Tournament</p>
      <p>
        <a href="https://ssplt10.com">Visit Website</a> | 
        <a href="mailto:support@ssplt10.com">Contact Support</a>
      </p>
      <p style="margin-top: 15px; font-size: 12px;">
        This is an automated email. Please do not reply to this message.<br>
        © ${new Date().getFullYear()} SSPL T10. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
};

/**
 * Send registration confirmation email
 * @param data - Registration and payment details
 * @returns Promise that resolves with success message or rejects with error
 */
export const sendRegistrationConfirmation = async (
  data: RegistrationEmailData,
): Promise<string> => {
  // Dynamically load SMTP.js when needed
  try {
    await loadSMTPLibrary();
  } catch (error) {
    throw new Error('Failed to load email service. Please check your internet connection.');
  }

  // Check if SMTP.js is now loaded
  if (!window.Email) {
    throw new Error('Email service unavailable. Please try again.');
  }

  // Validate environment variables
  const smtpHost = import.meta.env.VITE_SMTP_HOST;
  const smtpUser = import.meta.env.VITE_SMTP_USER;
  const smtpPassword = import.meta.env.VITE_SMTP_PASSWORD;
  const smtpFromEmail = import.meta.env.VITE_SMTP_FROM_EMAIL || smtpUser;
  const smtpFromName = import.meta.env.VITE_SMTP_FROM_NAME || 'SSPL T10';

  if (!smtpHost || !smtpUser || !smtpPassword) {
    throw new Error('Email configuration missing. Please contact administrator.');
  }

  // Validate email address
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    throw new Error('Invalid email address provided.');
  }

  try {
    const htmlBody = generateEmailTemplate(data);

    const result = await window.Email.send({
      Host: smtpHost,
      Username: smtpUser,
      Password: smtpPassword,
      To: data.email,
      From: `${smtpFromName} <${smtpFromEmail}>`,
      Subject: `Registration Confirmed - SSPL T10 | Registration ID: ${data.registrationId}`,
      Body: htmlBody,
    });

    // SMTP.js returns 'OK' on success
    if (result === 'OK') {
      return 'Email sent successfully';
    } 
      throw new Error(`Failed to send email: ${result}`);
    
  } catch (error) {
    throw error;
  }
};

/**
 * Validate email service configuration
 * @returns true if configuration is valid
 */
export const validateEmailConfig = (): boolean => {
  const required = [
    import.meta.env.VITE_SMTP_HOST,
    import.meta.env.VITE_SMTP_USER,
    import.meta.env.VITE_SMTP_PASSWORD,
  ];

  return required.every(value => value && value !== '' && !value.includes('your-'));
};

export default {
  sendRegistrationConfirmation,
  validateEmailConfig,
};

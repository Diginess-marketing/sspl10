import 'dotenv/config';

const GRAPH_API_BASE = 'https://graph.microsoft.com/v1.0';
const TOKEN_ENDPOINT = 'https://login.microsoftonline.com';

const tenantId = process.env.MSGRAPH_TENANT_ID || '98c6c39a-2b35-49a5-9108-7ec8c544c802';
const clientId = process.env.MSGRAPH_CLIENT_ID || 'f44441c1-1ad2-4e0a-a70e-12fa4b76e0eb';
const clientSecret = process.env.MSGRAPH_CLIENT_SECRET || 'B928Q~l-_5joIIcQQdlc5qcYc.O9lSVChLJtnbwy';
const senderEmail = process.env.MSGRAPH_FROM_EMAIL || 'hello@ssplt10.co.in';

async function getAccessToken() {
  const tokenUrl = `${TOKEN_ENDPOINT}/${tenantId}/oauth2/v2.0/token`;
  
  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    scope: 'https://graph.microsoft.com/.default',
    grant_type: 'client_credentials'
  });

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params.toString()
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get access token: ${error}`);
  }

  const data = await response.json();
  return data.access_token;
}

function generateEmailTemplate(data) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.7;
      color: #1a202c;
      margin: 0;
      padding: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .email-wrapper {
      padding: 40px 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .header {
      background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #60a5fa 100%);
      color: #ffffff;
      padding: 50px 30px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .header::before {
      content: '🏏';
      position: absolute;
      font-size: 120px;
      opacity: 0.1;
      top: -20px;
      right: -20px;
      transform: rotate(-15deg);
    }
    .header h1 {
      margin: 0;
      font-size: 42px;
      font-weight: 900;
      letter-spacing: 2px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
    }
    .header p {
      margin: 15px 0 0 0;
      font-size: 18px;
      opacity: 0.95;
      font-weight: 300;
      letter-spacing: 1px;
    }
    .trophy-section {
      text-align: center;
      padding: 30px;
      background: linear-gradient(to bottom, #fef3c7, #ffffff);
    }
    .trophy {
      font-size: 80px;
    }
    .success-badge {
      display: inline-block;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 12px 24px;
      border-radius: 30px;
      font-size: 16px;
      font-weight: bold;
      margin-top: 10px;
      box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 24px;
      color: #1e3a8a;
      font-weight: 700;
      margin-bottom: 20px;
    }
    .highlight-box {
      background: linear-gradient(135deg, #e0e7ff 0%, #dbeafe 100%);
      border-left: 5px solid #3b82f6;
      padding: 25px;
      margin: 25px 0;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
    }
    .highlight-box p {
      margin: 0;
      font-size: 16px;
      line-height: 1.8;
    }
    .next-steps {
      background: #f8fafc;
      padding: 25px;
      border-radius: 12px;
      margin: 25px 0;
      border: 2px dashed #cbd5e1;
    }
    .next-steps h3 {
      color: #1e3a8a;
      font-size: 20px;
      margin: 0 0 15px 0;
      display: flex;
      align-items: center;
    }
    .next-steps h3::before {
      content: '🎯';
      font-size: 24px;
      margin-right: 10px;
    }
    .next-steps ul {
      margin: 10px 0;
      padding-left: 25px;
    }
    .next-steps li {
      margin: 12px 0;
      color: #475569;
      font-size: 15px;
    }
    .support-box {
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      padding: 20px;
      border-radius: 12px;
      margin: 25px 0;
      text-align: center;
      border: 2px solid #fbbf24;
    }
    .support-box p {
      margin: 8px 0;
      font-size: 15px;
      color: #92400e;
    }
    .support-box a {
      color: #1e40af;
      text-decoration: none;
      font-weight: 700;
    }
    .motivational-quote {
      background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
      color: white;
      padding: 30px;
      text-align: center;
      font-style: italic;
      font-size: 18px;
      margin: 20px 0;
      border-radius: 12px;
      box-shadow: 0 8px 20px rgba(30, 58, 138, 0.3);
    }
    .motivational-quote::before {
      content: '"';
      font-size: 60px;
      opacity: 0.3;
      line-height: 0;
    }
    .footer {
      background: #1e293b;
      color: #cbd5e1;
      padding: 30px 20px;
      text-align: center;
      font-size: 14px;
    }
    .footer p {
      margin: 8px 0;
    }
    .footer a {
      color: #60a5fa;
      text-decoration: none;
      font-weight: 600;
    }
    .footer a:hover {
      color: #93c5fd;
    }
    .social-icons {
      margin: 20px 0;
      font-size: 24px;
    }
    @media only screen and (max-width: 600px) {
      .email-wrapper {
        padding: 20px 10px;
      }
      .container {
        border-radius: 15px;
      }
      .header h1 {
        font-size: 32px;
      }
      .content {
        padding: 30px 20px;
      }
      .trophy {
        font-size: 60px;
      }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="container">
      <div class="header">
        <h1>🏏 SSPL T10 🏏</h1>
        <p>Southern Street Premier League</p>
      </div>
      
      <div class="trophy-section">
        <div class="trophy">🏆</div>
        <span class="success-badge">✓ Trial Scheduled!</span>
      </div>
      
      <div class="content">
        <div class="greeting">Dear ${data.playerName} 🔥</div>
        
        <p>Thank you for registering for the Southern Street Premier League (SSPL)!</p>
        
        <p>We are excited to invite you to attend your SSPL Trial as per the details below:</p>

        <div class="highlight-box" style="margin-bottom: 25px;">
          <h4 style="color: #1e3a8a; margin-top: 0; margin-bottom: 5px;">📍 Venue:</h4>
          <p style="margin: 0;"><strong>Nexus, Royapettah</strong><br>
          232/272, Avvai Shanmugham Salai,<br>
          Azad Nagar, Royapettah,<br>
          Chennai, Tamil Nadu – 600014</p>
          
          <p style="margin: 10px 0 0 0;"><strong>Location Link:</strong> <a href="https://share.google/cmCahPXRtdlQELegl" style="color: #2563eb; text-decoration: none; font-weight: bold;">Google Maps</a></p>
          
          <hr style="border: none; border-top: 1px dashed #cbd5e1; margin: 15px 0;">
          
          <h4 style="color: #1e3a8a; margin-bottom: 5px;">📅 Date:</h4>
          <p style="margin: 0;"><strong>Saturday, 18th July 2026</strong></p>
          
          <hr style="border: none; border-top: 1px dashed #cbd5e1; margin: 15px 0;">
          
          <h4 style="color: #1e3a8a; margin-bottom: 5px;">⏰ Reporting Time:</h4>
          <p style="margin: 0;"><em>(Your reporting slot will be communicated separately.)</em></p>
        </div>

        <div class="next-steps" style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin-bottom: 25px;">
          <h4 style="color: #b45309; margin-top: 0; margin-bottom: 10px; font-size: 16px;">⚠️ Important Instructions:</h4>
          <ul style="margin: 0; padding-left: 20px; color: #78350f;">
            <li style="margin-bottom: 5px;">Players must report <strong>30 minutes prior</strong> to their allotted reporting time.</li>
            <li style="margin-bottom: 5px;">Players must wear <strong>proper sports attire and sports shoes</strong>.</li>
            <li style="margin-bottom: 5px;">Players should bring their <strong>own cricket kit</strong> if available.</li>
            <li style="margin-bottom: 0;"><strong>Tennis balls</strong> will be provided by SSPL.</li>
          </ul>
        </div>
        
        <div class="travel-guide" style="background: #ffffff; border: 2px solid #3b82f6; border-radius: 12px; margin: 25px 0; padding: 25px; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);">
          <h3 style="color: #1e3a8a; margin-top: 0; font-size: 20px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">🏟️ SSPL T10 – Travel Guide to Nexus Sports Arena, Chennai</h3>
          
          <h4 style="color: #1e3a8a; margin-bottom: 5px;">📍 Venue:</h4>
          <p style="margin-top: 0;"><strong>Nexus Sports Arena</strong><br>
          232/272, Avvai Shanmugam Salai, Azad Nagar, Royapettah, Chennai – 600014</p>
          
          <hr style="border: none; border-top: 1px dashed #cbd5e1; margin: 15px 0;">
          
          <h4 style="color: #1e3a8a; margin-bottom: 5px;">🚆 If You Are Arriving by Train</h4>
          <p style="margin-bottom: 5px;"><strong>1. Chennai Central Railway Station (Approx. 6 km)</strong></p>
          <ul style="margin-top: 5px; margin-bottom: 15px; padding-left: 20px; color: #475569; font-size: 15px;">
            <li style="margin: 8px 0;">🚖 <strong>Taxi/Cab:</strong> 20–30 minutes</li>
            <li style="margin: 8px 0;">🚇 <strong>Metro:</strong> Take the Metro from Chennai Central to Government Estate Station. From there, take an auto/cab (10–15 minutes) to the venue.</li>
            <li style="margin: 8px 0;">🛺 <strong>Auto Rickshaw:</strong> Available outside the station.</li>
          </ul>
          
          <p style="margin-bottom: 5px;"><strong>2. Chennai Egmore Railway Station (Approx. 4 km)</strong></p>
          <ul style="margin-top: 5px; margin-bottom: 15px; padding-left: 20px; color: #475569; font-size: 15px;">
            <li style="margin: 8px 0;">🚖 <strong>Taxi/Cab:</strong> 15–20 minutes</li>
            <li style="margin: 8px 0;">🛺 <strong>Auto Rickshaw:</strong> Easily available</li>
            <li style="margin: 8px 0;">🚌 <strong>MTC buses</strong> towards Royapettah/Mylapore are also available.</li>
          </ul>
          
          <hr style="border: none; border-top: 1px dashed #cbd5e1; margin: 15px 0;">
          
          <h4 style="color: #1e3a8a; margin-bottom: 5px;">✈️ If You Are Arriving by Flight</h4>
          <p style="margin-bottom: 5px;"><strong>Chennai International Airport (Approx. 18 km)</strong></p>
          <ul style="margin-top: 5px; margin-bottom: 15px; padding-left: 20px; color: #475569; font-size: 15px;">
            <li style="margin: 8px 0;"><strong>Option 1 – Taxi/Cab (Recommended):</strong> Travel Time: 40–60 minutes (depending on traffic)</li>
            <li style="margin: 8px 0;"><strong>Option 2 – Metro:</strong> Board the Metro from Airport Station. Get down at Government Estate Station. Take an auto/cab to Nexus Sports Arena (10–15 minutes).</li>
          </ul>
          
          <hr style="border: none; border-top: 1px dashed #cbd5e1; margin: 15px 0;">
          
          <h4 style="color: #1e3a8a; margin-bottom: 5px;">🚌 By City Bus</h4>
          <p style="margin-top: 0; margin-bottom: 15px; color: #475569; font-size: 15px;">Buses connecting Royapettah, Mylapore, Teynampet, Adyar, and Central Chennai stop within walking distance or a short auto ride from the venue.</p>
          
          <hr style="border: none; border-top: 1px dashed #cbd5e1; margin: 15px 0;">
          
          <h4 style="color: #1e3a8a; margin-bottom: 5px;">📍 Using Google Maps</h4>
          <p style="margin-top: 0; margin-bottom: 15px; color: #475569; font-size: 15px;">Search for: <strong>“Nexus Sports Arena, Royapettah, Chennai”</strong></p>
          
          <hr style="border: none; border-top: 1px dashed #cbd5e1; margin: 15px 0;">
          
          <h4 style="color: #1e3a8a; margin-bottom: 5px;">📱 Before You Travel</h4>
          <ul style="margin-top: 5px; margin-bottom: 15px; padding-left: 20px; color: #475569; font-size: 15px;">
            <li style="margin: 8px 0;">✅ Carry your SSPL registration confirmation.</li>
            <li style="margin: 8px 0;">✅ Reach the venue at least 30–45 minutes before your reporting time.</li>
            <li style="margin: 8px 0;">✅ Wear appropriate cricket attire and sports shoes.</li>
            <li style="margin: 8px 0;">✅ Bring your own bat, gloves, and personal gear if applicable.</li>
            <li style="margin: 8px 0;">✅ Keep a valid ID proof handy.</li>
          </ul>
          
          <hr style="border: none; border-top: 1px dashed #cbd5e1; margin: 15px 0;">
          
          <h4 style="color: #1e3a8a; margin-bottom: 5px;">📞 Assistance</h4>
          <p style="margin-top: 0; margin-bottom: 15px; color: #475569; font-size: 15px;">WhatsApp Support: <strong>88077 75960</strong></p>
          
          <p style="margin-bottom: 0; font-weight: 600; color: #059669; line-height: 1.6;">We look forward to seeing you at the SSPL Technical & Simulation Level Trials. Travel safely and all the best for your performance!</p>
        </div>
        
        <p>This is your opportunity to showcase your cricketing talent and begin your SSPL journey. Step onto the field with confidence and give it your best! 💪🏏</p>
        
        <p>All the very best!</p>
        
        <p style="margin-bottom: 0;">Warm Regards,<br>
        <strong>SSPL Team</strong><br>
        📱 88077 75960<br>
        🌐 <a href="https://www.ssplt10.co.in" style="color: #2563eb; text-decoration: none;">www.ssplt10.co.in</a></p>
      </div>
      
      <div class="footer">
        <div class="social-icons">
          🌐 🏏 ⚡
        </div>
        <p><strong>Southern Street Premier League (SSPL T10)</strong></p>
        <p>
          <a href="https://ssplt10.com">🌐 Visit Website</a> | 
          <a href="mailto:customercare@ssplt10.co.in">📧 Contact Support</a>
        </p>
        <p style="margin-top: 20px; font-size: 12px; opacity: 0.8;">
          This is an automated email. Please do not reply to this message.<br>
          © ${new Date().getFullYear()} SSPL T10. All rights reserved.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

async function sendEmail() {
  const emailData = {
    email: 'gokulnath.4c@gmail.com',
    playerName: 'Gokulnath'
  };

  const accessToken = await getAccessToken();
  const htmlBody = generateEmailTemplate(emailData);
  
  const emailPayload = {
    message: {
      subject: `Welcome to SSPL – Your Trial is Scheduled for 18 July 2026`,
      body: {
        contentType: 'HTML',
        content: htmlBody
      },
      toRecipients: [
        {
          emailAddress: {
            address: emailData.email,
            name: emailData.playerName
          }
        }
      ],
      from: {
        emailAddress: {
          address: senderEmail,
          name: 'SSPL T10'
        }
      }
    },
    saveToSentItems: true
  };

  const sendMailUrl = `${GRAPH_API_BASE}/users/${senderEmail}/sendMail`;

  console.log('Sending email...');
  const response = await fetch(sendMailUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(emailPayload)
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to send email via Microsoft Graph: ${response.status} ${error}`);
  }
  
  console.log('Email sent successfully!');
}

sendEmail().catch(console.error);

// @ts-types="https://deno.land/x/types/index.d.ts"

import { serve } from 'https://deno.land/std@0.192.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

declare const Deno: {
    env: {
        get(key: string): string | undefined;
    };
}

const GRAPH_API_BASE = 'https://graph.microsoft.com/v1.0';
const TOKEN_ENDPOINT = 'https://login.microsoftonline.com';

interface InviteRequest {
    email: string;
    role: string;
    inviteLink: string;
}

async function getAccessToken(): Promise<string> {
    const clientId = Deno.env.get('AZURE_CLIENT_ID');
    const clientSecret = Deno.env.get('AZURE_CLIENT_SECRET');
    const tenantId = Deno.env.get('AZURE_TENANT_ID');

    if (!clientId || !clientSecret || !tenantId) {
        throw new Error('Azure credentials not configured.');
    }

    const tokenUrl = `${TOKEN_ENDPOINT}/${tenantId}/oauth2/v2.0/token`;

    const params = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        scope: 'https://graph.microsoft.com/.default',
        grant_type: 'client_credentials'
    });

    const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
    });

    if (!response.ok) {
        throw new Error(`Failed to get access token: ${await response.text()}`);
    }

    const data = await response.json();
    return data.access_token;
}

function generateEmailTemplate(data: InviteRequest): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; }
    .header { background-color: #1e3a8a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { padding: 30px 20px; }
    .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
    .footer { text-align: center; font-size: 12px; color: #666; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Admin Panel Invitation</h1>
    </div>
    <div class="content">
      <p>Hello,</p>
      <p>You have been invited to join the <strong>SSPL T10 Admin Panel</strong> as a <strong>${data.role.toUpperCase()}</strong>.</p>
      <p>Click the button below to accept the invitation and log in:</p>
      <div style="text-align: center;">
        <a href="${data.inviteLink}" class="button">Access Admin Panel</a>
      </div>
      <p>If the button doesn't work, copy and paste this link into your browser:</p>
      <p style="background: #f1f5f9; padding: 10px; border-radius: 4px; word-break: break-all;">${data.inviteLink}</p>
    </div>
    <div class="footer">
      <p>This is an automated message. Please do not reply.</p>
    </div>
  </div>
</body>
</html>
  `;
}

async function sendEmail(accessToken: string, data: InviteRequest): Promise<void> {
    const senderEmail = Deno.env.get('AZURE_SENDER_EMAIL');

    if (!senderEmail) throw new Error('AZURE_SENDER_EMAIL not configured.');

    const payload = {
        message: {
            subject: `Start Managing SSPL T10 - ${data.role} Access`,
            body: {
                contentType: 'HTML',
                content: generateEmailTemplate(data)
            },
            toRecipients: [{ emailAddress: { address: data.email } }],
            from: { emailAddress: { address: senderEmail } }
        },
        saveToSentItems: true
    };

    const response = await fetch(`${GRAPH_API_BASE}/users/${senderEmail}/sendMail`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error(`Graph API Error: ${await response.text()}`);
    }
}

serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    };

    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { email, role, inviteLink } = await req.json();

        if (!email || !role || !inviteLink) {
            throw new Error('Missing required fields: email, role, inviteLink');
        }

        const accessToken = await getAccessToken();
        await sendEmail(accessToken, { email, role, inviteLink });

        return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500
        });
    }
});

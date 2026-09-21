import fetch from 'node-fetch';
import env from '../config/env.js';
import * as emailLogModel from '../model/emailLogModel.js';
import logger from '../utils/logger.js';

const TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000;

/**
 * MS Graph throttles hard on large attachments, so bulk sends go out one at a
 * time with a pause between them rather than in parallel batches.
 */
const BULK_CHUNK_SIZE = 1;
const BULK_CHUNK_DELAY_MS = 2000;

let accessToken = null;
let tokenExpiry = 0;

/** Client-credentials token for the Graph API, cached until shortly before expiry. */
async function getAccessToken() {
  if (accessToken && Date.now() < tokenExpiry - TOKEN_REFRESH_BUFFER_MS) {
    return accessToken;
  }

  const { tenantId, clientId, clientSecret } = env.msGraph;
  if (!tenantId || !clientId || !clientSecret) {
    throw new Error('Missing Microsoft Graph credentials');
  }

  const params = new URLSearchParams({
    client_id: clientId,
    scope: 'https://graph.microsoft.com/.default',
    client_secret: clientSecret,
    grant_type: 'client_credentials',
  });

  const response = await fetch(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    { method: 'POST', body: params }
  );
  const data = await response.json();

  if (data.error) {
    throw new Error(`Auth Error: ${data.error_description || data.error}`);
  }

  accessToken = data.access_token;
  tokenExpiry = Date.now() + data.expires_in * 1000;
  return accessToken;
}

function buildRecipient(address) {
  return { emailAddress: { address } };
}

/**
 * Send a single message through MS Graph.
 * Returns `{ success }` rather than throwing, so bulk sends can carry on.
 *
 * @param {{to:string, cc?:string, subject:string, html?:string, text?:string,
 *          attachments?:Array}} message
 */
export async function sendEmail({ to, cc, subject, html, text, attachments = [] }) {
  try {
    const token = await getAccessToken();
    const fromEmail = env.msGraph.fromEmail;
    if (!fromEmail) throw new Error('MSGRAPH_FROM_EMAIL is not configured');

    const payload = {
      message: {
        subject,
        body: {
          contentType: html ? 'HTML' : 'Text',
          content: html || text,
        },
        toRecipients: [buildRecipient(to)],
        ...(cc ? { ccRecipients: [buildRecipient(cc)] } : {}),
        attachments: attachments.map((att) => ({
          '@odata.type': '#microsoft.graph.fileAttachment',
          name: att.name,
          contentType: att.contentType,
          contentBytes: att.contentBytes,
          isInline: att.isInline || false,
          contentId: att.contentId || null,
        })),
      },
      saveToSentItems: 'false',
    };

    const response = await fetch(
      `https://graph.microsoft.com/v1.0/users/${fromEmail}/sendMail`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Graph API Error: ${response.status} ${JSON.stringify(errorData)}`);
    }

    return { success: true };
  } catch (error) {
    logger.error('Error sending email via Graph API:', error);
    return { success: false, error: error.message };
  }
}

const stripHtml = (html) => html.replace(/<[^>]*>?/gm, '');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Send one message to many recipients, logging each outcome to `email_logs`.
 *
 * @returns {Promise<{success:number, failed:number, successful:string[],
 *                    errors:Array<{email:string, error:string}>}>}
 */
export async function sendBulkEmail(recipients, subject, htmlContent, attachments = []) {
  const results = { success: 0, failed: 0, successful: [], errors: [] };

  logger.info(`Starting bulk email to ${recipients.length} recipients via MS Graph...`);
  if (attachments.length > 0) {
    logger.info(`Bulk email carries ${attachments.length} attachment(s)`);
  }

  for (let i = 0; i < recipients.length; i += BULK_CHUNK_SIZE) {
    const chunk = recipients.slice(i, i + BULK_CHUNK_SIZE);

    await Promise.all(
      chunk.map(async (email) => {
        const res = await sendEmail({
          to: email,
          subject,
          html: htmlContent,
          text: stripHtml(htmlContent),
          attachments,
        });

        if (res.success) {
          results.success += 1;
          results.successful.push(email);
        } else {
          results.failed += 1;
          results.errors.push({ email, error: res.error });
        }

        try {
          await emailLogModel.insert({
            recipientEmail: email,
            type: 'bulk_campaign',
            success: res.success,
            error: res.error,
          });
        } catch (logErr) {
          logger.error('Failed to log email:', logErr);
        }
      })
    );

    await sleep(BULK_CHUNK_DELAY_MS);
  }

  return results;
}

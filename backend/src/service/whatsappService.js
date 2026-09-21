import axios from 'axios';
import env from '../config/env.js';
import logger from '../utils/logger.js';

const apiUrl = () =>
  `https://graph.facebook.com/${env.whatsapp.apiVersion}/${env.whatsapp.phoneNumberId}/messages`;

const headers = () => ({
  Authorization: `Bearer ${env.whatsapp.accessToken}`,
  'Content-Type': 'application/json',
});

function assertConfigured() {
  if (!env.whatsapp.phoneNumberId || !env.whatsapp.accessToken) {
    throw new Error(
      'WhatsApp is not configured (WHATSAPP_PHONE_NUMBER_ID / WHATSAPP_ACCESS_TOKEN).'
    );
  }
}

/**
 * Send a text message via the WhatsApp Cloud API.
 * @param {string} to Recipient phone number, country code included, no '+'.
 * @param {string} text
 */
export async function sendMessage(to, text) {
  assertConfigured();
  try {
    const response = await axios.post(
      apiUrl(),
      { messaging_product: 'whatsapp', to, text: { body: text } },
      { headers: headers() }
    );
    logger.info('WhatsApp message sent:', response.data);
    return response.data;
  } catch (error) {
    logger.error(
      'Error sending WhatsApp message:',
      error.response ? error.response.data : error.message
    );
    throw error;
  }
}

/**
 * Mark an inbound message as read. Best-effort: failures are logged, not thrown,
 * since they must not stop us from replying.
 */
export async function markAsRead(messageId) {
  try {
    assertConfigured();
    await axios.post(
      apiUrl(),
      { messaging_product: 'whatsapp', status: 'read', message_id: messageId },
      { headers: headers() }
    );
  } catch (error) {
    logger.error('Error marking WhatsApp message as read:', error.message);
  }
}

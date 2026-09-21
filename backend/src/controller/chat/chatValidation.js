const ApiError = require('../../utils/ApiError');

const WHATSAPP_OBJECT = 'whatsapp_business_account';

/**
 * Validate an inbound web chat turn.
 * @returns {{message:string, history:Array, sessionId:string|undefined,
 *            mobile:string|undefined}}
 */
function validateWebChat(body = {}) {
  const { message, history, sessionId, mobile } = body;

  if (!message || typeof message !== 'string' || !message.trim()) {
    throw ApiError.badRequest('Message is required');
  }

  return {
    message: message.trim(),
    history: Array.isArray(history) ? history : [],
    sessionId,
    mobile,
  };
}

/**
 * Validate the Meta webhook subscription handshake.
 * @returns {{mode:string, token:string, challenge:string}}
 */
function validateWebhookHandshake(query = {}) {
  const mode = query['hub.mode'];
  const token = query['hub.verify_token'];
  const challenge = query['hub.challenge'];

  if (!mode || !token) {
    throw ApiError.badRequest('Missing hub.mode or hub.verify_token');
  }

  return { mode, token, challenge };
}

/**
 * Flatten a WhatsApp webhook payload into the text messages it carries.
 * Non-text messages and other event types are ignored.
 *
 * @returns {Array<{from:string, text:string, messageId:string}>}
 */
function extractTextMessages(body = {}) {
  if (body.object !== WHATSAPP_OBJECT) return null;

  const messages = [];

  for (const entry of body.entry || []) {
    for (const change of entry.changes || []) {
      for (const message of change.value?.messages || []) {
        if (message.type === 'text') {
          messages.push({
            from: message.from,
            text: message.text.body,
            messageId: message.id,
          });
        }
      }
    }
  }

  return messages;
}

module.exports = { WHATSAPP_OBJECT, validateWebChat, validateWebhookHandshake, extractTextMessages };

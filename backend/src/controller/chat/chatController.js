import env from '../../config/env.js';
import * as aiService from '../../service/aiService.js';
import * as whatsappService from '../../service/whatsappService.js';
import * as chatLogModel from '../../model/chatLogModel.js';
import logger from '../../utils/logger.js';
import * as validation from './chatValidation.js';

/** POST /api/chat/web */
export const handleWebChat = async (req, res) => {
  const { message, history, sessionId, mobile } = validation.validateWebChat(req.body);

  await chatLogModel.insert({
    role: 'user',
    message,
    platform: 'web',
    mobileNumber: mobile,
    metadata: { sessionId },
  });

  const response = await aiService.generateResponse(message, history);

  await chatLogModel.insert({
    role: 'assistant',
    message: response,
    platform: 'web',
    mobileNumber: mobile,
    metadata: { sessionId },
  });

  res.json({ success: true, response });
};

/**
 * GET /api/chat/whatsapp/webhook
 * Meta's subscription handshake: echo the challenge when the token matches.
 */
export const verifyWhatsAppWebhook = (req, res) => {
  const { mode, token, challenge } = validation.validateWebhookHandshake(req.query);

  if (mode === 'subscribe' && token === env.whatsapp.verifyToken) {
    logger.info('WhatsApp webhook verified');
    res.status(200).send(challenge);
    return;
  }

  res.sendStatus(403);
};

/**
 * POST /api/chat/whatsapp/webhook
 * Answer each inbound text message with the support agent.
 */
export const handleWhatsAppWebhook = async (req, res) => {
  const messages = validation.extractTextMessages(req.body);

  if (messages === null) {
    res.sendStatus(404);
    return;
  }

  // Acknowledge immediately; Meta retries anything it does not see a 200 for.
  res.sendStatus(200);

  for (const { from, text, messageId } of messages) {
    try {
      logger.info(`Received WhatsApp message from ${from}: ${text}`);

      await chatLogModel.insert({
        role: 'user',
        message: text,
        platform: 'whatsapp',
        mobileNumber: from,
        metadata: { messageId },
      });

      await whatsappService.markAsRead(messageId);

      const reply = await aiService.generateResponse(text, []);

      await chatLogModel.insert({
        role: 'assistant',
        message: reply,
        platform: 'whatsapp',
        mobileNumber: from,
        metadata: { to: from },
      });

      await whatsappService.sendMessage(from, reply);
    } catch (error) {
      logger.error(`Failed to handle WhatsApp message from ${from}:`, error);
    }
  }
};

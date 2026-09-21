import express from 'express';
import asyncHandler from '../../utils/asyncHandler.js';
import * as controller from './chatController.js';

const router = express.Router();

router.post('/chat/web', asyncHandler(controller.handleWebChat));

router.get('/chat/whatsapp/webhook', asyncHandler(controller.verifyWhatsAppWebhook));
router.post('/chat/whatsapp/webhook', asyncHandler(controller.handleWhatsAppWebhook));

export default router;

const express = require('express');
const asyncHandler = require('../../utils/asyncHandler');
const controller = require('./chatController');

const router = express.Router();

router.post('/chat/web', asyncHandler(controller.handleWebChat));

router.get('/chat/whatsapp/webhook', asyncHandler(controller.verifyWhatsAppWebhook));
router.post('/chat/whatsapp/webhook', asyncHandler(controller.handleWhatsAppWebhook));

module.exports = router;

const express = require('express');

const paymentRouters = require('./payment/paymentRouters');
const emailRouters = require('./email/emailRouters');
const chatRouters = require('./chat/chatRouters');
const aiQueryRouters = require('./aiQuery/aiQueryRouters');

/**
 * Every module router, mounted under a single `/api` prefix by app.js.
 * Add new modules here rather than in app.js.
 */
const router = express.Router();

router.use(paymentRouters);
router.use(emailRouters);
router.use(chatRouters);
router.use(aiQueryRouters);

module.exports = router;

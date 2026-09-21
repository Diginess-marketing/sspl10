import express from 'express';

import paymentRouters from './payment/paymentRouters.js';
import emailRouters from './email/emailRouters.js';
import chatRouters from './chat/chatRouters.js';
import aiQueryRouters from './aiQuery/aiQueryRouters.js';

/**
 * Every module router, mounted under a single `/api` prefix by app.js.
 * Add new modules here rather than in app.js.
 */
const router = express.Router();

router.use(paymentRouters);
router.use(emailRouters);
router.use(chatRouters);
router.use(aiQueryRouters);

export default router;

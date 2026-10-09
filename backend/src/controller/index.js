import express from 'express';

import paymentRouters from './payment/paymentRouters.js';
import emailRouters from './email/emailRouters.js';
import chatRouters from './chat/chatRouters.js';
import aiQueryRouters from './aiQuery/aiQueryRouters.js';
import trialRouters from './trial/trialRouters.js';
import workflowRouters from './workflow/workflowRouters.js';
import enquiryRouters from './enquiry/enquiryRouters.js';
import registrationRouters from './registration/registrationRouters.js';
import qrRouters from './qr/qrRouters.js';
import staffRouters from './staff/staffRouters.js';

/**
 * Every module router, mounted under a single `/api` prefix by app.js.
 * Add new modules here rather than in app.js.
 */
const router = express.Router();

router.use(paymentRouters);
router.use(emailRouters);
router.use(chatRouters);
router.use(aiQueryRouters);
router.use(trialRouters);
router.use(workflowRouters);
router.use(enquiryRouters);
router.use(registrationRouters);
router.use(qrRouters);
router.use(staffRouters);

export default router;

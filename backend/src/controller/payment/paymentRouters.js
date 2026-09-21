import express from 'express';
import asyncHandler from '../../utils/asyncHandler.js';
import * as controller from './paymentController.js';

const router = express.Router();

// --- Public ---
router.get('/health', controller.health);
router.get('/config', asyncHandler(controller.getConfig));
router.post('/create-order', asyncHandler(controller.createOrder));
router.get('/sse/:registrationId', controller.subscribe);
router.post('/verify-payment', asyncHandler(controller.verifyPayment));

// --- Razorpay callback ---
router.post('/webhooks/razorpay', asyncHandler(controller.handleWebhook));

// --- Admin ---
// NOTE: these are currently unauthenticated, as they were before the
// restructure. To lock them down, require the middleware here:
//   import { requireAdmin } from '../../middleware/authMiddleware.js';
//   router.use('/admin/razorpay', requireAdmin);
router.get('/admin/razorpay/transactions', asyncHandler(controller.listTransactions));
router.get('/admin/razorpay/export', asyncHandler(controller.exportTransactions));
router.get('/admin/razorpay/stats', asyncHandler(controller.getStats));
router.get('/admin/razorpay/reconcile', asyncHandler(controller.reconcile));

export default router;

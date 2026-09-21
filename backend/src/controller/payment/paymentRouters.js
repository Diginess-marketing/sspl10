const express = require('express');
const asyncHandler = require('../../utils/asyncHandler');
const controller = require('./paymentController');

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
//   const { requireAdmin } = require('../../middleware/authMiddleware');
//   router.use('/admin/razorpay', requireAdmin);
router.get('/admin/razorpay/transactions', asyncHandler(controller.listTransactions));
router.get('/admin/razorpay/export', asyncHandler(controller.exportTransactions));
router.get('/admin/razorpay/stats', asyncHandler(controller.getStats));
router.get('/admin/razorpay/reconcile', asyncHandler(controller.reconcile));

module.exports = router;

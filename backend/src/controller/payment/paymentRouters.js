import express from 'express';
import asyncHandler from '../../utils/asyncHandler.js';
import * as controller from './paymentController.js';
import { requirePermission } from '../../middleware/authMiddleware.js';

const router = express.Router();

// --- Public ---
router.get('/health', controller.health);
router.get('/config', asyncHandler(controller.getConfig));
// The frontend (src/integrations/razorpayService.ts) still calls the /razorpay/* paths of
// the pre-restructure server, so both paths are served.
router.post(['/create-order', '/razorpay/create-order'], asyncHandler(controller.createOrder));
router.get('/sse/:registrationId', controller.subscribe);
router.post(['/verify-payment', '/razorpay/verify-payment'], asyncHandler(controller.verifyPayment));

// --- Razorpay callback ---
router.post('/webhooks/razorpay', asyncHandler(controller.handleWebhook));

// --- Admin (signed-in admins only: these expose every payment) ---
router.use('/admin/razorpay', requirePermission('view_payments'));
router.get('/admin/razorpay/transactions', asyncHandler(controller.listTransactions));
router.get('/admin/razorpay/export', asyncHandler(controller.exportTransactions));
router.get('/admin/razorpay/stats', asyncHandler(controller.getStats));
// Reconcile refreshes the ledger and settles missed payments: finance and super admins only
router.get('/admin/razorpay/reconcile', requirePermission('manage_payments'), asyncHandler(controller.reconcile));

export default router;

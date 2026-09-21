import express from 'express';
import asyncHandler from '../../utils/asyncHandler.js';
import * as controller from './emailController.js';

const router = express.Router();

// NOTE: unauthenticated, as before the restructure. To lock down, add
// `requireAdmin` from ../../middleware/authMiddleware here.
router.post('/admin/email/bulk', asyncHandler(controller.sendBulk));
router.get('/admin/email/logs', asyncHandler(controller.listLogs));

export default router;

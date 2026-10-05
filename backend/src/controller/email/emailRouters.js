import express from 'express';
import asyncHandler from '../../utils/asyncHandler.js';
import { requireAdmin } from '../../middleware/authMiddleware.js';
import * as controller from './emailController.js';

const router = express.Router();

// Admin only: these send mail to players and expose send logs.
router.post('/admin/email/bulk', requireAdmin, asyncHandler(controller.sendBulk));
router.get('/admin/email/logs', requireAdmin, asyncHandler(controller.listLogs));

router.get('/admin/email/templates', requireAdmin, asyncHandler(controller.listTemplates));
router.put('/admin/email/templates/:key', requireAdmin, asyncHandler(controller.saveTemplate));
router.post('/admin/email/preview', requireAdmin, asyncHandler(controller.previewTemplate));
router.post('/admin/email/test', requireAdmin, asyncHandler(controller.sendTest));

export default router;

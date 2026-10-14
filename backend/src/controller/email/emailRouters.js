import express from 'express';
import asyncHandler from '../../utils/asyncHandler.js';
import { requirePermission } from '../../middleware/authMiddleware.js';
import * as controller from './emailController.js';

const router = express.Router();

// Admin only: these send mail to players and expose send logs.
router.post('/admin/email/bulk', requirePermission('send_messages'), asyncHandler(controller.sendBulk));
router.get('/admin/email/logs', requirePermission('send_messages'), asyncHandler(controller.listLogs));

router.get('/admin/email/templates', requirePermission('send_messages'), asyncHandler(controller.listTemplates));
router.put('/admin/email/templates/:key', requirePermission('send_messages'), asyncHandler(controller.saveTemplate));
router.post('/admin/email/preview', requirePermission('send_messages'), asyncHandler(controller.previewTemplate));
router.post('/admin/email/test', requirePermission('send_messages'), asyncHandler(controller.sendTest));

export default router;

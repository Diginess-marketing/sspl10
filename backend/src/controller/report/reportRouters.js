import express from 'express';
import asyncHandler from '../../utils/asyncHandler.js';
import { requirePermission } from '../../middleware/authMiddleware.js';
import * as controller from './reportController.js';

const router = express.Router();

// Reports (PRD section 9)
router.get('/admin/reports/daily-summary', requirePermission('view_reports'), asyncHandler(controller.dailySummary));
router.post('/admin/reports/daily-summary/send', requirePermission('manage_staff'), asyncHandler(controller.sendSummaryNow));
router.get('/admin/reports/data-quality', requirePermission('view_reports'), asyncHandler(controller.dataQuality));

export default router;

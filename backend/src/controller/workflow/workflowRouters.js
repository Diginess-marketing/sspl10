import express from 'express';
import asyncHandler from '../../utils/asyncHandler.js';
import { requirePermission } from '../../middleware/authMiddleware.js';
import * as controller from './workflowController.js';

const router = express.Router();

router.post('/admin/workflow/move-to-trials', requirePermission('manage_trials'), asyncHandler(controller.moveToTrials));
router.post('/admin/workflow/confirmation-email', requirePermission('manage_trials'), asyncHandler(controller.sendConfirmation));
router.post('/admin/workflow/slot', requirePermission('manage_trials'), asyncHandler(controller.assignSlot));
router.post('/admin/workflow/allocate', requirePermission('manage_trials'), asyncHandler(controller.allocateToTrials));
router.post('/admin/workflow/attendance', requirePermission('manage_trials'), asyncHandler(controller.markAttendance));
router.post('/admin/workflow/results', requirePermission('manage_trials'), asyncHandler(controller.saveResults));

export default router;

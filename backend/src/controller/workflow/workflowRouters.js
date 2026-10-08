import express from 'express';
import asyncHandler from '../../utils/asyncHandler.js';
import { requireAdmin } from '../../middleware/authMiddleware.js';
import * as controller from './workflowController.js';

const router = express.Router();

router.post('/admin/workflow/move-to-trials', requireAdmin, asyncHandler(controller.moveToTrials));
router.post('/admin/workflow/confirmation-email', requireAdmin, asyncHandler(controller.sendConfirmation));
router.post('/admin/workflow/slot', requireAdmin, asyncHandler(controller.assignSlot));

export default router;

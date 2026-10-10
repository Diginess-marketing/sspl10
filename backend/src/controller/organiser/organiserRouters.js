import express from 'express';
import asyncHandler from '../../utils/asyncHandler.js';
import { requirePermission } from '../../middleware/authMiddleware.js';
import * as controller from './organiserController.js';

const router = express.Router();

// Organiser approval, kit tracking and event results
router.patch('/admin/organizers/:id', requirePermission('manage_trials'), asyncHandler(controller.update));

export default router;

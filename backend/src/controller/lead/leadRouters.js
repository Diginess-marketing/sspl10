import express from 'express';
import asyncHandler from '../../utils/asyncHandler.js';
import { requirePermission } from '../../middleware/authMiddleware.js';
import * as controller from './leadController.js';

const router = express.Router();

// Visitor follow-up call list (PRD 7.9)
router.get('/admin/leads', requirePermission('manage_campaigns'), asyncHandler(controller.list));
router.patch('/admin/leads/:id', requirePermission('manage_campaigns'), asyncHandler(controller.update));

export default router;

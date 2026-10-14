import express from 'express';
import asyncHandler from '../../utils/asyncHandler.js';
import { requirePermission } from '../../middleware/authMiddleware.js';
import * as controller from './staffController.js';

const router = express.Router();

// Super admins: staff roles, action history and the 30-day bin
router.put('/admin/staff/:userId/role', requirePermission('manage_staff'), asyncHandler(controller.setRole));
router.get('/admin/audit', requirePermission('manage_staff'), asyncHandler(controller.listAudit));
router.post('/admin/audit/:id/restore', requirePermission('manage_staff'), asyncHandler(controller.restore));

export default router;

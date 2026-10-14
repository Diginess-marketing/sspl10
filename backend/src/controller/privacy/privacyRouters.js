import express from 'express';
import asyncHandler from '../../utils/asyncHandler.js';
import { requirePermission } from '../../middleware/authMiddleware.js';
import * as controller from './privacyController.js';

const router = express.Router();

// A player's data: download or erase on request (super admins)
router.get('/admin/privacy/registrations/:id/export', requirePermission('manage_staff'), asyncHandler(controller.exportData));
router.post('/admin/privacy/registrations/:id/erase', requirePermission('manage_staff'), asyncHandler(controller.erase));

export default router;

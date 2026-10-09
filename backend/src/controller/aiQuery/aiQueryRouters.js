import express from 'express';
import asyncHandler from '../../utils/asyncHandler.js';
import { requirePermission } from '../../middleware/authMiddleware.js';
import * as controller from './aiQueryController.js';

const router = express.Router();

// Answers questions from the database: admins with report access only (was open to anyone)
router.post('/admin/ai-query', requirePermission('view_reports'), asyncHandler(controller.handleQuery));

export default router;

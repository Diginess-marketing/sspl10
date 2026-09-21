import express from 'express';
import asyncHandler from '../../utils/asyncHandler.js';
import * as controller from './aiQueryController.js';

const router = express.Router();

// NOTE: unauthenticated, as before the restructure. To lock down, add
// `requireAdmin` from ../../middleware/authMiddleware here.
router.post('/admin/ai-query', asyncHandler(controller.handleQuery));

export default router;

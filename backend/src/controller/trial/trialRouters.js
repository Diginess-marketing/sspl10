import express from 'express';
import asyncHandler from '../../utils/asyncHandler.js';
import { requireAdmin } from '../../middleware/authMiddleware.js';
import * as controller from './trialController.js';

const router = express.Router();

router.patch('/admin/trials/candidates/:id/levels/:level', requireAdmin, asyncHandler(controller.updateLevel));
router.post('/admin/trials/candidates/:id/levels/:level/notify', requireAdmin, asyncHandler(controller.resendLevelEmail));
router.get('/admin/trials/candidates/:id/levels/:level/certificate', requireAdmin, asyncHandler(controller.downloadCertificate));
router.post('/admin/trials/sync-candidates', requireAdmin, asyncHandler(controller.syncCandidates));

export default router;

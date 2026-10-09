import express from 'express';
import asyncHandler from '../../utils/asyncHandler.js';
import { requirePermission } from '../../middleware/authMiddleware.js';
import * as controller from './trialController.js';

const router = express.Router();

router.patch('/admin/trials/candidates/:id/levels/:level', requirePermission('manage_trials'), asyncHandler(controller.updateLevel));
router.post('/admin/trials/candidates/:id/levels/:level/notify', requirePermission('manage_trials'), asyncHandler(controller.resendLevelEmail));
router.get('/admin/trials/candidates/:id/levels/:level/certificate', requirePermission('manage_trials'), asyncHandler(controller.downloadCertificate));
router.post('/admin/trials/sync-candidates', requirePermission('manage_trials'), asyncHandler(controller.syncCandidates));

// Public: check a certificate number
router.get('/certificates/:number', asyncHandler(controller.verifyCertificate));

export default router;

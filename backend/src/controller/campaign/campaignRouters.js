import express from 'express';
import asyncHandler from '../../utils/asyncHandler.js';
import { requirePermission } from '../../middleware/authMiddleware.js';
import * as controller from './campaignController.js';

const router = express.Router();

// QR and campaign manager (PRD section 7)
router.get('/admin/campaigns/qr', requirePermission('manage_campaigns'), asyncHandler(controller.listQr));
router.post('/admin/campaigns/qr', requirePermission('manage_campaigns'), asyncHandler(controller.createQr));
router.patch('/admin/campaigns/qr/:code', requirePermission('manage_campaigns'), asyncHandler(controller.updateQr));

// Public: a partner's own sign-up numbers, behind a signed link
router.get('/partner/:code', asyncHandler(controller.partnerStats));

export default router;

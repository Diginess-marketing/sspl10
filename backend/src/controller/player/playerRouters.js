import express from 'express';
import asyncHandler from '../../utils/asyncHandler.js';
import { requireAuth } from '../../middleware/authMiddleware.js';
import * as controller from './playerController.js';

const router = express.Router();

// The signed-in player's own registrations, receipts and certificates (PRD feature 10)
router.get('/player/me', requireAuth, asyncHandler(controller.me));
router.get('/player/me/receipt/:registrationId', requireAuth, asyncHandler(controller.receipt));
router.get('/player/me/certificate/:registrationId/:level', requireAuth, asyncHandler(controller.certificate));

export default router;

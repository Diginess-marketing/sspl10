import express from 'express';
import asyncHandler from '../../utils/asyncHandler.js';
import { requireAuth, requirePermission } from '../../middleware/authMiddleware.js';
import * as controller from './trialEventController.js';

const router = express.Router();

// Admin: trial dates, capacity and selectors
router.get('/admin/trial-events', requirePermission('manage_trials'), asyncHandler(controller.list));
router.post('/admin/trial-events', requirePermission('manage_trials'), asyncHandler(controller.create));
router.get('/admin/trial-events/selectors', requirePermission('manage_trials'), asyncHandler(controller.approvedSelectors));
router.put('/admin/trial-events/:id', requirePermission('manage_trials'), asyncHandler(controller.update));
router.delete('/admin/trial-events/:id', requirePermission('manage_trials'), asyncHandler(controller.remove));
router.post('/admin/trial-events/:id/selectors', requirePermission('manage_trials'), asyncHandler(controller.assignSelector));
router.delete('/admin/trial-events/:id/selectors/:email', requirePermission('manage_trials'), asyncHandler(controller.unassignSelector));

// Selector scoring on a phone (signed-in selectors see only their trials)
router.get('/selector/trials', requireAuth, asyncHandler(controller.myTrials));
router.get('/selector/trials/:id/players', requireAuth, asyncHandler(controller.trialPlayers));
router.post('/selector/allocations/:allocationId/attendance', requireAuth, asyncHandler(controller.markAttendance));
router.post('/selector/allocations/:allocationId/results', requireAuth, asyncHandler(controller.saveResults));

export default router;

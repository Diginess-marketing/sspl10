import express from 'express';
import asyncHandler from '../../utils/asyncHandler.js';
import * as controller from './registrationController.js';

const router = express.Router();

// Public: the registration form (individual players)
router.post('/registrations/individual', asyncHandler(controller.saveIndividual));
router.post('/registrations/team', asyncHandler(controller.saveTeam));

export default router;

import express from 'express';
import asyncHandler from '../../utils/asyncHandler.js';
import * as controller from './registrationController.js';

const router = express.Router();

// Public: the registration form (individual players)
router.post('/registrations/individual', asyncHandler(controller.saveIndividual));

export default router;

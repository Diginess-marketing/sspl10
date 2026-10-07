import express from 'express';
import asyncHandler from '../../utils/asyncHandler.js';
import * as controller from './enquiryController.js';

const router = express.Router();

// Public: the website contact, sponsor and franchise forms
router.post('/enquiries', asyncHandler(controller.createEnquiry));

export default router;

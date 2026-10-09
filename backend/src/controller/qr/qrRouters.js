import express from 'express';
import asyncHandler from '../../utils/asyncHandler.js';
import * as controller from './qrController.js';

const router = express.Router();

// Public: counts QR scans from the /qr/:code page and from QR links that open /register
router.post('/qr/scan', asyncHandler(controller.recordScan));

export default router;

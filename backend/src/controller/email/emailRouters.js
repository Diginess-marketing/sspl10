const express = require('express');
const asyncHandler = require('../../utils/asyncHandler');
const controller = require('./emailController');

const router = express.Router();

// NOTE: unauthenticated, as before the restructure. To lock down, add
// `requireAdmin` from ../../middleware/authMiddleware here.
router.post('/admin/email/bulk', asyncHandler(controller.sendBulk));
router.get('/admin/email/logs', asyncHandler(controller.listLogs));

module.exports = router;

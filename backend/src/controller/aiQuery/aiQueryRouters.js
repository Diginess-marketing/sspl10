const express = require('express');
const asyncHandler = require('../../utils/asyncHandler');
const controller = require('./aiQueryController');

const router = express.Router();

// NOTE: unauthenticated, as before the restructure. To lock down, add
// `requireAdmin` from ../../middleware/authMiddleware here.
router.post('/admin/ai-query', asyncHandler(controller.handleQuery));

module.exports = router;

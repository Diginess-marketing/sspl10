const express = require('express');
const router = express.Router();
const aiQueryController = require('../controllers/aiQueryController.cjs');

// AI Query Endpoint
router.post('/admin/ai-query', aiQueryController.handleQuery);

module.exports = router;

const express = require('express');
const router = express.Router();
const aiController = require('../aiController.js');

// Define the endpoint: POST /api/ai/analyze
router.post('/analyze', aiController.analyzePatterns);

module.exports = router;
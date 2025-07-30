const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');

// Generate questions based on job description and settings
router.post('/generate', questionController.generateQuestions);

// Get answer for a specific question
router.get('/answer/:questionId', questionController.getAnswer);

module.exports = router;
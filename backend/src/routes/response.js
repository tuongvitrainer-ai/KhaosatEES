const express = require('express');
const router = express.Router();
const responseController = require('../controllers/responseController');
const { authenticateToken, requireActive } = require('../middleware/auth');
const { validateResponse } = require('../middleware/validation');

// All routes require authentication and active account
router.use(authenticateToken);
router.use(requireActive);

router.post('/submit', validateResponse, responseController.submitResponse);
router.post('/complete', responseController.completeSurvey);
router.get('/survey/:surveyId', responseController.getUserResponses);

module.exports = router;

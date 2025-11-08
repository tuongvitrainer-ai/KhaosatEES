const express = require('express');
const router = express.Router();
const surveyController = require('../controllers/surveyController');
const { authenticateToken, requireActive } = require('../middleware/auth');

// All routes require authentication and active account
router.use(authenticateToken);
router.use(requireActive);

router.get('/active', surveyController.getActiveSurvey);
router.get('/:surveyId/progress', surveyController.getSurveyProgress);

module.exports = router;

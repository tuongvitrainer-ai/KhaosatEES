const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const {
  validateUserCreate,
  validateSurveyCreate,
  validateQuestionCreate,
} = require('../middleware/validation');

// All routes require authentication and admin privileges
router.use(authenticateToken);
router.use(requireAdmin);

// User management
router.get('/users', adminController.getAllUsers);
router.post('/users', validateUserCreate, adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);
router.post('/users/:id/reset-password', adminController.resetUserPassword);

// Survey management
router.get('/surveys', adminController.getAllSurveys);
router.post('/surveys', validateSurveyCreate, adminController.createSurvey);
router.put('/surveys/:id', adminController.updateSurvey);

// Question management
router.post('/questions', validateQuestionCreate, adminController.createQuestion);
router.put('/questions/:id', adminController.updateQuestion);
router.delete('/questions/:id', adminController.deleteQuestion);

// Reports and analytics
router.get('/surveys/:surveyId/responses', adminController.getSurveyResponses);
router.get('/surveys/:surveyId/summary', adminController.getSurveySummary);

// Google Sheets sync
router.post('/surveys/:surveyId/sync', adminController.syncToSheets);

module.exports = router;

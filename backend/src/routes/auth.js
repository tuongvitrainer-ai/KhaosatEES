const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { validateLogin, validatePasswordChange } = require('../middleware/validation');

// Public routes
router.post('/login', validateLogin, authController.login);

// Protected routes
router.get('/me', authenticateToken, authController.getCurrentUser);
router.post('/logout', authenticateToken, authController.logout);
router.post('/change-password', authenticateToken, validatePasswordChange, authController.changePassword);

module.exports = router;

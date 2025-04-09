const express = require('express');
const authController = require('../controllers/authController');
const { validate } = require('../middlewares/validation');
const auth = require('../middlewares/authMiddleware');
const { ROLES } = require('../models/userModel.js'); // Adjust the path as necessary
const router = express.Router();

/**
 * Authentication Routes
 */

// Public routes
// Register a new user account

// Login with Google OAuth
router.post('/google-login',
  validate(['googleId', 'email']),
  authController.googleLogin
);

// Forgot password - request verification code
router.post('/forgot-password',
  validate(['email']),
  authController.forgotPassword
);

// Reset password with verification code
router.post('/reset-password',
  validate(['code', 'email', 'newPassword']),
  authController.resetPassword
);

// Check if phone number exists
router.get('/check-phone',
  authController.checkPhoneExists
);

// Protected routes - require authentication
// Verify token validity
router.get('/verify-token',
  auth([ROLES.ADMIN, ROLES.CUSTOMER, ROLES.GUEST]),
  authController.verifyToken
);

// Change own password
router.post('/change-password',
  auth([ROLES.ADMIN, ROLES.CUSTOMER, ROLES.GUEST]),
  validate(['currentPassword', 'newPassword']),
  authController.changePassword
);

// Logout
router.post('/logout',
  auth([ROLES.ADMIN, ROLES.CUSTOMER, ROLES.GUEST]),
  authController.logout
);

// Admin routes
// Create a new user (admin function)
router.post('/users',
  auth([ROLES.ADMIN]),
  validate(['fullName', 'email', 'password', 'phone', 'role']),
  authController.createUser
);

// Admin reset user password
router.post('/reset-user-password',
  auth([ROLES.ADMIN]),
  validate(['userId', 'newPassword']),
  authController.adminResetPassword
);

module.exports = router;
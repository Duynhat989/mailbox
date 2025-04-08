const { User, ROLES } = require("../models/userModel");
const { encryption, compare } = require('../utils/encode');
const { createNewToken } = require('../middlewares/manageToken');
const { Op } = require('sequelize');
// const { sendEmailWelcome, sendEmailForget, sendEmailChangePass } = require('../utils/emailService');

/**
 * Authentication Controller
 */
const authController = {
  /**
   * Register a new user account
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @returns {Object} - Response with registered user information
   */
  googleLogin: async (req, res) => {
    try {
      const { googleId, email, fullName, picture, access_token } = req.body;

      let user = await User.findOne({ 
        where: { 
          [Op.or]: [
            { googleId },
            { email }
          ]
        } 
      });

      let isNewUser = false;

      // If account doesn't exist, create a new one
      if (!user) {
        isNewUser = true;
        user = await User.create({
          googleId,
          email,
          fullName,
          avatar: picture,
          role: ROLES.CUSTOMER,
          isActive: true
        });

        // Send welcome email for new users
        // sendEmailWelcome(email, fullName);
      } else if (!user.googleId) {
        // Update googleId if account exists but not linked to Google
        await user.update({ 
          googleId, 
          avatar: picture || user.avatar 
        });
      } else {
        // Update profile photo if it has changed
        if (picture && user.avatar !== picture) {
          await user.update({ avatar: picture });
        }
      }

      // Create JWT token
      const payload = { id: user.id, role: user.role };
      const token = createNewToken(payload);


      return res.json({
        success: true,
        message: isNewUser ? "Registration and login successful" : "Login successful",
        data: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
          token: token,
          isNewUser: isNewUser
        }
      });
    } catch (error) {
      console.error("Google login/register error:", error);
      return res.status(500).json({
        success: false,
        message: "System error, please try again later",
        data: null
      });
    }
  },

  /**
   * Verify if token is valid
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @returns {Object} - Response with user information
   */
  verifyToken: async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await User.findByPk(userId);
      
      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          message: "Invalid token or account is locked"
        });
      }

      return res.status(200).json({
        success: true,
        message: "Token is valid",
        data: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role
        }
      });
    } catch (error) {
      console.error("Token verification error:", error);
      return res.status(500).json({
        success: false,
        message: "System error, please try again later"
      });
    }
  },

  /**
   * Create a new user (Admin function)
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @returns {Object} - Response with created user information
   */
  createUser: async (req, res) => {
    const { fullName, email, password, phone, role } = req.body;

    try {
      // Check permissions (only admin can create any role)
      if (req.user.role !== ROLES.ADMIN && role !== ROLES.CUSTOMER) {
        return res.status(403).json({
          success: false,
          message: "You don't have permission to create an account with this role",
          data: null
        });
      }

      // Check if email or phone already exists
      const existingUser = await User.findOne({ 
        where: { 
          [Op.or]: [
            { email },
            { phone }
          ] 
        } 
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: existingUser.email === email ? "Email already exists" : "Phone number already exists",
          data: null
        });
      }

      // Encrypt password
      const hashedPassword = await encryption(password);
      
      // Create new user
      const newUser = await User.create({
        fullName,
        email,
        phone,
        password: hashedPassword,
        role
      });

      return res.status(201).json({
        success: true,
        message: "User created successfully",
        data: {
          id: newUser.id,
          fullName: newUser.fullName,
          phone: newUser.phone,
          email: newUser.email,
          role: newUser.role
        }
      });
    } catch (error) {
      console.error("Create user error:", error);
      return res.status(500).json({
        success: false,
        message: "System error, please try again later",
        data: null
      });
    }
  },

  /**
   * Forgot password - send verification code via email
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @returns {Object} - Response with user information
   */
  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({
        where: { email }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "No account found with this email"
        });
      }

      // Generate random verification code (8 digits)
      const verificationCode = Math.floor(10000000 + Math.random() * 90000000);
      
      // Update verification code in database
      await user.update({ verify: verificationCode.toString() });

      // Send email with verification code
      // sendEmailForget(user.email, user.fullName, verificationCode);

      return res.status(200).json({
        success: true,
        message: "Verification code has been sent to your email",
        data: {
          email: user.email
        }
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      return res.status(500).json({
        success: false,
        message: "System error, please try again later"
      });
    }
  },

  /**
   * Verify code and reset password
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @returns {Object} - Response with result
   */
  resetPassword: async (req, res) => {
    try {
      const { code, email, newPassword } = req.body;
      
      const user = await User.findOne({
        where: {
          email,
          verify: code
        }
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired verification code"
        });
      }

      // Encrypt new password
      const hashedPassword = await encryption(newPassword);
      
      // Update password and clear verification code
      await user.update({ 
        password: hashedPassword, 
        verify: null 
      });

      // Send email notification about password change
      // sendEmailChangePass(user.email, user.fullName);

      return res.status(200).json({
        success: true,
        message: "Password reset successful"
      });
    } catch (error) {
      console.error("Reset password error:", error);
      return res.status(500).json({
        success: false,
        message: "System error, please try again later"
      });
    }
  },

  /**
   * Admin reset user password
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @returns {Object} - Response with result
   */
  adminResetPassword: async (req, res) => {
    try {
      // Check admin permissions
      if (req.user.role !== ROLES.ADMIN) {
        return res.status(403).json({
          success: false,
          message: "You don't have permission to perform this action"
        });
      }

      const { userId, newPassword } = req.body;

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      // Encrypt new password
      const hashedPassword = await encryption(newPassword);
      
      // Update password and clear verification code
      await user.update({ 
        password: hashedPassword, 
        verify: null 
      });

      // Send email notification about password change
      // sendEmailChangePass(user.email, user.fullName);

      return res.status(200).json({
        success: true,
        message: "Password reset successful"
      });
    } catch (error) {
      console.error("Admin reset password error:", error);
      return res.status(500).json({
        success: false,
        message: "System error, please try again later"
      });
    }
  },

  /**
   * Change password
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @returns {Object} - Response with result
   */
  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;

      // Find user by ID
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      // Verify current password
      const isPasswordValid = await compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({
          success: false,
          message: "Current password is incorrect"
        });
      }

      // Encrypt new password
      const hashedPassword = await encryption(newPassword);
      
      // Update password
      await user.update({ 
        password: hashedPassword, 
        verify: null 
      });

      // Send email notification about password change
      // sendEmailChangePass(user.email, user.fullName);

      return res.status(200).json({
        success: true,
        message: "Password changed successfully"
      });
    } catch (error) {
      console.error("Change password error:", error);
      return res.status(500).json({
        success: false,
        message: "System error, please try again later"
      });
    }
  },

  /**
   * Check if phone number exists
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @returns {Object} - Response with result
   */
  checkPhoneExists: async (req, res) => {
    try {
      const { phone } = req.query;
      
      const user = await User.findOne({
        where: { phone }
      });

      return res.status(200).json({
        success: true,
        data: {
          exists: !!user
        }
      });
    } catch (error) {
      console.error("Check phone error:", error);
      return res.status(500).json({
        success: false,
        message: "System error, please try again later"
      });
    }
  },

  /**
   * Logout - just log the action
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @returns {Object} - Response with result
   */
  logout: async (req, res) => {
    try {
      // Log logout if userId is available
      if (req.user && req.user.id) {
        // Can log logout to LoginHistory if needed
      }
      
      return res.status(200).json({
        success: true,
        message: "Logout successful"
      });
    } catch (error) {
      console.error("Logout error:", error);
      return res.status(500).json({
        success: false,
        message: "System error"
      });
    }
  }
};

module.exports = authController;
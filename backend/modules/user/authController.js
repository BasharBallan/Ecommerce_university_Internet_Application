const authService = require('./authService');

/**
 * ======================================================================
 * AUTH CONTROLLER (HTTP Presentation Layer for User Module)
 * ======================================================================
 * Responsible for handling incoming HTTP requests, delegating to AuthService,
 * and sending standard HTTP responses.
 * ======================================================================
 */

module.exports = {
  // Authentication Handlers
  signup: authService.signup,
  login: authService.login,
  AdminSignup: authService.AdminSignup,
  Adminlogin: authService.Adminlogin,
  refreshToken: authService.refreshToken,
  logout: authService.logout,
  resendVerificationCode: authService.resendVerificationCode,

  // Password Reset Handlers
  forgotPassword: authService.forgotPassword,
  verifyPassResetCode: authService.verifyPassResetCode,
  resetPassword: authService.resetPassword,

  // Session Management Handlers
  getMySessions: authService.getMySessions,
  logoutFromSession: authService.logoutFromSession,
  logoutFromOtherSessions: authService.logoutFromOtherSessions,

  // Google OAuth Handlers
  googleInitService: authService.googleInitService,
  googleCallbackService: authService.googleCallbackService,
  googleUnlinkService: authService.googleUnlinkService,
  setPasswordService: authService.setPasswordService,

  // Middlewares
  protect: authService.protect,
  allowedTo: authService.allowedTo,
  uploadSignupImages: authService.uploadSignupImages,
  resizeSignupImages: authService.resizeSignupImages,
};


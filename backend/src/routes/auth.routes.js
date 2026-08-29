const express = require('express');
const router = express.Router();
const {
  register,
  login,
  googleAuth,
  checkEmailExists,
  verifyEmail,
  resendVerification,
  getCaptchaEndpoint,
  forgotPassword,
  resetPassword,
  setupMfa,
  verifyMfaSetup,
  disableMfa,
  getSecurityLogs,
  me,
  logout,
  deleteAccount
} = require('../controllers/auth.controller');

const authMiddleware = require('../middleware/auth');
const { loginLimiter, registerLimiter } = require('../middleware/rateLimiter');
const {
  validateBody,
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  mfaVerifySchema
} = require('../middleware/validate');

// Public Authentication Endpoints
router.post('/google', googleAuth);
router.post('/check-email', checkEmailExists);
router.post('/register', registerLimiter, validateBody(registerSchema), register);
router.post('/login', loginLimiter, validateBody(loginSchema), login);
router.get('/captcha', getCaptchaEndpoint);

// Email Verification endpoints
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);

router.post('/forgot-password', loginLimiter, validateBody(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validateBody(resetPasswordSchema), resetPassword);

// Protected Authentication Endpoints
router.get('/me', authMiddleware, me);
router.post('/mfa/setup', authMiddleware, setupMfa);
router.post('/mfa/verify-setup', authMiddleware, validateBody(mfaVerifySchema), verifyMfaSetup);
router.post('/mfa/disable', authMiddleware, disableMfa);
router.get('/security-logs', authMiddleware, getSecurityLogs);
router.post('/logout', authMiddleware, logout);
router.delete('/account', authMiddleware, deleteAccount);

module.exports = router;

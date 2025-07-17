const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const {
  registerUser, 
  loginUser, 
  logoutUser, 
  getCurrentUser, 
  generateNewAccessToken,
  forgotPassword,
  resetPassword,
  verifyUserEmail,
  initiate2FAPasswordReset,
  verify2FACodesAndResetPassword,
  setup2FA,
  verifyAndEnable2FA,
  disable2FA,
  verifyUserCode,
  resendVerificationCode
} = require('../controllers/authController');
const { testEmailConfig } = require('../helpers/smtpTransport');
const requireSignIn = require("../middleware/requireSignIn");
const verifyCodeMiddleware = require("../middleware/verifyCodeMiddleware");
const { generalLimiter, authLimiter, uploadLimiter } = require("../middleware/rateLimiter");

const authRouter = express.Router();

// User registration and authentication
authRouter.post('/register', authLimiter, registerUser);
authRouter.post('/login', authLimiter, loginUser);
authRouter.post("/logout", requireSignIn, logoutUser);
authRouter.get("/me", requireSignIn, getCurrentUser);

// Email verification
authRouter.post('/verify', authLimiter, verifyCodeMiddleware, verifyUserCode);
authRouter.post('/verify-email', verifyUserEmail);
authRouter.post('/resend-code', resendVerificationCode);

// Password reset
authRouter.post('/forgot-password', forgotPassword);
authRouter.post('/reset-password', resetPassword);

// 2FA Password reset
authRouter.post('/forgot-password-2fa', initiate2FAPasswordReset);
authRouter.post('/reset-password-2fa', verify2FACodesAndResetPassword);

// 2FA Management
authRouter.post('/setup-2fa', requireSignIn, setup2FA);
authRouter.post('/verify-2fa', requireSignIn, verifyAndEnable2FA);
authRouter.post('/disable-2fa', requireSignIn, disable2FA);

// Token refresh
authRouter.get("/token", generateNewAccessToken);

// Protected dashboard route example
authRouter.get('/dashboard', requireSignIn, async (req, res) => {
  // Only allow access if user is verified
  const user = req.user;
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  // Optionally, fetch user from DB to check isVerified
  // const dbUser = await User.findById(user.userId);
  // if (!dbUser || !dbUser.isVerified) return res.status(401).json({ error: 'Not verified' });
  res.json({ message: `Welcome to your dashboard, ${user.firstName || ''}!` });
});

// Google OAuth
authRouter.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
authRouter.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/login' }), (req, res) => {
  // Generate JWT and redirect to frontend with token
  const token = jwt.sign({ userId: req.user._id, email: req.user.email }, process.env.JWT_SECRET, { expiresIn: '24h' });
  res.redirect(`${process.env.FRONTEND_BASE_URL || 'http://localhost:5173'}/oauth-success?token=${token}`);
});

// LinkedIn OAuth
authRouter.get('/linkedin', passport.authenticate('linkedin', { scope: ['r_emailaddress', 'r_liteprofile'] }));
authRouter.get('/linkedin/callback', passport.authenticate('linkedin', { session: false, failureRedirect: '/login' }), (req, res) => {
  // Generate JWT and redirect to frontend with token
  const token = jwt.sign({ userId: req.user._id, email: req.user.email }, process.env.JWT_SECRET, { expiresIn: '24h' });
  res.redirect(`${process.env.FRONTEND_BASE_URL || 'http://localhost:5173'}/oauth-success?token=${token}`);
});

// Test email configuration (development only)
if (process.env.NODE_ENV === 'development') {
  authRouter.post('/test-email', async (req, res) => {
    try {
      const success = await testEmailConfig();
      if (success) {
        res.status(200).json({
          success: true,
          message: 'Email configuration test successful! Check your inbox.'
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Email configuration test failed. Check server logs for details.'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Email test error',
        error: error.message
      });
    }
  });
}

module.exports = authRouter;
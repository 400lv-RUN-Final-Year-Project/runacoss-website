const User = require('../models/userModel');
const Verification = require('../models/verificationModel');

// Middleware to validate verification code and user
const verifyCodeMiddleware = async (req, res, next) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ error: 'Email and code are required.' });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }
    if (user.isVerified) {
      return res.status(400).json({ error: 'User already verified' });
    }
    const verification = await Verification.findOne({
      userId: user._id,
      code,
      used: false,
      expiresAt: { $gt: new Date() }
    });
    if (!verification) {
      return res.status(400).json({ error: 'Invalid or expired code' });
    }
    req.user = user;
    req.verification = verification;
    next();
  } catch (error) {
    console.error('Verification middleware error:', error);
    return res.status(500).json({ error: 'Server Error' });
  }
};

module.exports = verifyCodeMiddleware; 
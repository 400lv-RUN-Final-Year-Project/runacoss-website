const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const requireUserSignIn = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: "Access denied. No token provided." });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user exists and is active
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ error: "Invalid token. User not found." });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: "Account is deactivated." });
    }

    if (!user.isVerified) {
      return res.status(401).json({ error: "Please verify your email first." });
    }

    // Add user info to request
    req.user = {
      userId: user._id,
      email: user.email,
      role: user.role || 'user',
      fullName: `${user.firstName} ${user.lastName}`
    };

    next();
  } catch (error) {
    console.error('User authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: "Invalid token." });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: "Token expired." });
    }
    
    res.status(500).json({ error: "Server Error" });
  }
};

module.exports = requireUserSignIn; 
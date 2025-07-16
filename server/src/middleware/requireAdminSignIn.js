const jwt = require("jsonwebtoken");
const Admin = require("../models/adminModel");

const requireAdminSignIn = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: "Access denied. No token provided." });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if admin exists and is active
    const admin = await Admin.findById(decoded.adminId).select('-password');
    if (!admin) {
      return res.status(401).json({ error: "Invalid token. Admin not found." });
    }

    if (!admin.isActive) {
      return res.status(401).json({ error: "Account is deactivated." });
    }

    if (!admin.isVerified) {
      return res.status(401).json({ error: "Please verify your email first." });
    }

    // Add admin info to request
    req.admin = {
      adminId: admin._id,
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions,
      fullName: admin.fullName
    };

    next();
  } catch (error) {
    console.error('Admin authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: "Invalid token." });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: "Token expired." });
    }
    
    res.status(500).json({ error: "Server Error" });
  }
};

module.exports = requireAdminSignIn; 
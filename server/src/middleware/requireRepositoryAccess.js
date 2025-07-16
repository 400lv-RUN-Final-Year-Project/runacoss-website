const User = require('../models/userModel');

// Middleware to allow only approved and permitted users to access the repository
module.exports = async (req, res, next) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: "Authentication required." });
    }

    // Get the full user object from database to check approval status
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    if (!user.isApproved || !user.canAccessRepository) {
      return res.status(403).json({ 
        error: "You are not approved to access the repository. Please contact an administrator." 
      });
    }

    next();
  } catch (error) {
    console.error('Repository access middleware error:', error);
    return res.status(500).json({ error: "Server error checking repository access." });
  }
}; 
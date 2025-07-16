/**
 * Middleware to require admin role
 * Ensures that only users with admin role can access the route
 */
const requireAdmin = (req, res, next) => {
  try {
    // Check if user exists (from requireSignIn middleware)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // Check if user has admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Administrator privileges required.',
        requiredRole: 'admin',
        userRole: req.user.role
      });
    }

    // Log admin action for audit trail
    console.log(`🔐 Admin action by ${req.user.email} (${req.user.role}) - ${req.method} ${req.originalUrl}`);

    next();
  } catch (error) {
    console.error('❌ Admin middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error in admin verification'
    });
  }
};

module.exports = requireAdmin; 
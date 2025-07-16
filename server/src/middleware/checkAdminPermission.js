const checkAdminPermission = (module, action) => {
  return (req, res, next) => {
    try {
      const admin = req.admin;

      if (!admin) {
        return res.status(401).json({ error: "Authentication required" });
      }

      // Super admin has all permissions
      if (admin.role === 'super-admin') {
        return next();
      }

      // Check specific permission
      const modulePermissions = admin.permissions[module];
      if (!modulePermissions) {
        return res.status(403).json({ 
          error: "Insufficient permissions",
          details: `No permissions for module: ${module}`
        });
      }

      const hasPermission = modulePermissions[action];
      if (!hasPermission) {
        return res.status(403).json({ 
          error: "Insufficient permissions",
          details: `No permission for action: ${action} in module: ${module}`
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ error: "Server Error" });
    }
  };
};

module.exports = checkAdminPermission; 
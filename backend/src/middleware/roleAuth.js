const requireRole = (roles) => {
  return (req, res, next) => {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    const userRole = req.user.role;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    // Check if user has required role
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        success: false, 
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${userRole}` 
      });
    }

    next();
  };
};

// Admin only access
const requireAdmin = requireRole(['admin']);

// Manager level access (admin + manufacturing_manager)
const requireManager = requireRole(['admin', 'manufacturing_manager']);

// Inventory access (admin + manufacturing_manager + inventory_manager)
const requireInventoryAccess = requireRole(['admin', 'manufacturing_manager', 'inventory_manager']);

// Any authenticated user
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required' 
    });
  }
  next();
};

module.exports = { 
  requireRole,
  requireAdmin,
  requireManager,
  requireInventoryAccess,
  requireAuth
};

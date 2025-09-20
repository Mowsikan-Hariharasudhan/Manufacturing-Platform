const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleAuth');

const router = express.Router();

// Basic user routes - can be expanded later
router.get('/profile', authenticateToken, (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user.user_id,
      username: req.user.username,
      email: req.user.email,
      firstName: req.user.first_name,
      lastName: req.user.last_name,
      role: req.user.role
    }
  });
});

module.exports = router;

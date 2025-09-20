const express = require('express');
const { body, param } = require('express-validator');
const { getAllWorkOrders, updateWorkOrderStatus } = require('../controllers/workOrderController');
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleAuth');
const { validationMiddleware } = require('../middleware/validation');

const router = express.Router();

const updateStatusValidation = [
  param('id').isUUID().withMessage('Invalid work order ID'),
  body('status').isIn(['pending', 'started', 'paused', 'completed', 'cancelled']).withMessage('Invalid status'),
  body('notes').optional().isLength({ max: 500 }).withMessage('Notes must be less than 500 characters')
];

router.get('/', authenticateToken, getAllWorkOrders);
router.patch('/:id/status', authenticateToken, requireRole(['admin', 'manufacturing_manager', 'operator']), updateStatusValidation, validationMiddleware, updateWorkOrderStatus);

module.exports = router;

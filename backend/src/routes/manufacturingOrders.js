const express = require('express');
const { body, param } = require('express-validator');
const { 
  getAllOrders, 
  getOrderById, 
  createOrder, 
  updateOrder 
} = require('../controllers/manufacturingOrderController');
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleAuth');
const { validationMiddleware } = require('../middleware/validation');

const router = express.Router();

const createOrderValidation = [
  body('bomId')
    .isUUID()
    .withMessage('Valid BOM ID required'),
  body('quantityToProduce')
    .isFloat({ min: 0.01 })
    .withMessage('Quantity must be greater than 0'),
  body('priority')
    .optional()
    .isIn(['low', 'normal', 'high', 'urgent'])
    .withMessage('Invalid priority level'),
  body('scheduledStartDate')
    .optional()
    .isISO8601()
    .withMessage('Valid start date required'),
  body('scheduledEndDate')
    .optional()
    .isISO8601()
    .withMessage('Valid end date required'),
  body('assignedTo')
    .optional()
    .isUUID()
    .withMessage('Valid user ID required')
];

const updateOrderValidation = [
  param('id').isUUID().withMessage('Invalid order ID'),
  body('status')
    .optional()
    .isIn(['planned', 'in_progress', 'completed', 'cancelled'])
    .withMessage('Invalid status'),
  body('priority')
    .optional()
    .isIn(['low', 'normal', 'high', 'urgent'])
    .withMessage('Invalid priority level'),
  body('quantityProduced')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Quantity produced must be a positive number')
];

router.get('/', 
  authenticateToken, 
  requireRole(['admin', 'manufacturing_manager', 'inventory_manager']), 
  getAllOrders
);

router.get('/:id', 
  authenticateToken, 
  requireRole(['admin', 'manufacturing_manager', 'inventory_manager']), 
  param('id').isUUID().withMessage('Invalid order ID'),
  validationMiddleware,
  getOrderById
);

router.post('/', 
  authenticateToken, 
  requireRole(['admin', 'manufacturing_manager']), 
  createOrderValidation,
  validationMiddleware,
  createOrder
);

router.put('/:id', 
  authenticateToken, 
  requireRole(['admin', 'manufacturing_manager', 'operator']), 
  updateOrderValidation,
  validationMiddleware,
  updateOrder
);

module.exports = router;

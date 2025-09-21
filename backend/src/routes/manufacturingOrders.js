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
    .optional()
    .isUUID()
    .withMessage('Valid BOM ID required'),
  body('productName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Product name required when BOM ID not provided'),
  body('quantityToProduce')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Quantity must be greater than 0'),
  body('quantity')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Quantity must be greater than 0'),
  body('priority')
    .optional()
    .isIn(['low', 'normal', 'high', 'urgent'])
    .withMessage('Invalid priority level'),
  body('scheduledStartDate')
    .optional()
    .custom((value) => {
      if (value === '' || value === null || value === undefined) return true;
      return !isNaN(Date.parse(value));
    })
    .withMessage('Valid start date required'),
  body('startDate')
    .optional()
    .custom((value) => {
      if (value === '' || value === null || value === undefined) return true;
      return !isNaN(Date.parse(value));
    })
    .withMessage('Valid start date required'),
  body('scheduledEndDate')
    .optional()
    .custom((value) => {
      if (value === '' || value === null || value === undefined) return true;
      return !isNaN(Date.parse(value));
    })
    .withMessage('Valid end date required'),
  body('dueDate')
    .optional()
    .custom((value) => {
      if (value === '' || value === null || value === undefined) return true;
      return !isNaN(Date.parse(value));
    })
    .withMessage('Valid due date required'),
  body('assignedTo')
    .optional()
    .custom((value) => {
      // Allow empty strings, null, or valid UUIDs
      if (value === '' || value === null || value === undefined) return true;
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      return uuidRegex.test(value);
    })
    .withMessage('Valid user ID required'),
  body('assignee')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 0, max: 100 })
    .withMessage('Assignee name must be less than 100 characters'),
  body('orderNumber')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Order number must be less than 50 characters'),
  body('status')
    .optional()
    .isIn(['planned', 'in_progress', 'in-progress', 'completed', 'cancelled'])
    .withMessage('Invalid status'),
  body('unit')
    .optional()
    .isString()
    .trim()
    .withMessage('Unit must be a string'),
  body('progress')
    .optional()
    .isNumeric()
    .withMessage('Progress must be a number'),
  body('componentStatus')
    .optional()
    .isString()
    .trim()
    .withMessage('Component status must be a string')
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
  requireRole(['admin', 'manufacturing_manager', 'inventory_manager', 'operator']), 
  getAllOrders
);

router.get('/:id', 
  authenticateToken, 
  requireRole(['admin', 'manufacturing_manager', 'inventory_manager', 'operator']), 
  param('id').isUUID().withMessage('Invalid order ID'),
  validationMiddleware,
  getOrderById
);

router.post('/', 
  authenticateToken, 
  requireRole(['admin', 'manufacturing_manager', 'operator']), 
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
// Update: Sun, Sep 21, 2025  8:28:54 AM

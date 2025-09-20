const express = require('express');
const { body, param } = require('express-validator');
const { 
  getStockLedger, 
  getStockMovements, 
  recordStockMovement, 
  getStockAlerts 
} = require('../controllers/stockController');
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleAuth');
const { validationMiddleware } = require('../middleware/validation');

const router = express.Router();

const recordMovementValidation = [
  body('productId')
    .isUUID()
    .withMessage('Valid product ID required'),
  body('movementType')
    .isIn(['in', 'out', 'adjustment'])
    .withMessage('Invalid movement type'),
  body('quantity')
    .isFloat({ min: 0.01 })
    .withMessage('Quantity must be greater than 0'),
  body('referenceType')
    .optional()
    .isIn(['manufacturing_order', 'work_order', 'manual_adjustment', 'opening_stock'])
    .withMessage('Invalid reference type'),
  body('referenceId')
    .optional()
    .isUUID()
    .withMessage('Valid reference ID required'),
  body('remarks')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Remarks must be less than 500 characters')
];

router.get('/ledger', 
  authenticateToken, 
  getStockLedger
);

router.get('/movements', 
  authenticateToken, 
  getStockMovements
);

router.post('/movements', 
  authenticateToken, 
  requireRole(['admin', 'manufacturing_manager', 'inventory_manager']), 
  recordMovementValidation,
  validationMiddleware,
  recordStockMovement
);

router.get('/alerts', 
  authenticateToken, 
  getStockAlerts
);

module.exports = router;

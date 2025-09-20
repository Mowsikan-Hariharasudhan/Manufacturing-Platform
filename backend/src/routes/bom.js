const express = require('express');
const { body, param } = require('express-validator');
const { getAllBOMs, getBOMById, createBOM } = require('../controllers/bomController');
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleAuth');
const { validationMiddleware } = require('../middleware/validation');

const router = express.Router();

const createBOMValidation = [
  body('bomCode').trim().notEmpty().withMessage('BOM code required'),
  body('bomName').trim().notEmpty().withMessage('BOM name required'),
  body('finishedProductId').isUUID().withMessage('Valid finished product ID required'),
  body('components').isArray({ min: 1 }).withMessage('At least one component required'),
  body('components.*.productId').isUUID().withMessage('Valid component product ID required'),
  body('components.*.quantityRequired').isFloat({ min: 0.01 }).withMessage('Quantity must be greater than 0')
];

router.get('/', authenticateToken, getAllBOMs);
router.get('/:id', authenticateToken, param('id').isUUID(), validationMiddleware, getBOMById);
router.post('/', authenticateToken, requireRole(['admin', 'manufacturing_manager']), createBOMValidation, validationMiddleware, createBOM);

module.exports = router;

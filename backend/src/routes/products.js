const express = require('express');
const { body, param, query } = require('express-validator');
const { 
  getAllProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} = require('../controllers/productController');
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleAuth');
const { validationMiddleware } = require('../middleware/validation');

const router = express.Router();

// Validation rules
const createProductValidation = [
  body('productCode')
    .trim()
    .notEmpty()
    .withMessage('Product code required')
    .isLength({ max: 50 })
    .withMessage('Product code must be less than 50 characters'),
  body('productName')
    .trim()
    .notEmpty()
    .withMessage('Product name required')
    .isLength({ max: 100 })
    .withMessage('Product name must be less than 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('unitOfMeasure')
    .trim()
    .notEmpty()
    .withMessage('Unit of measure required'),
  body('productType')
    .isIn(['raw_material', 'finished_good', 'semi_finished'])
    .withMessage('Invalid product type'),
  body('minimumStock')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum stock must be a positive number'),
  body('standardCost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Standard cost must be a positive number'),
  body('initialStock')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Initial stock must be a positive number')
];

const updateProductValidation = [
  param('id').isUUID().withMessage('Invalid product ID'),
  body('productName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Product name cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Product name must be less than 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('unitOfMeasure')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Unit of measure cannot be empty'),
  body('minimumStock')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum stock must be a positive number'),
  body('standardCost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Standard cost must be a positive number')
];

const getProductValidation = [
  param('id').isUUID().withMessage('Invalid product ID')
];

// Routes
router.get('/', 
  authenticateToken, 
  getAllProducts
);

router.get('/:id', 
  authenticateToken, 
  getProductValidation,
  validationMiddleware,
  getProductById
);

router.post('/', 
  authenticateToken, 
  requireRole(['admin', 'manufacturing_manager', 'inventory_manager']), 
  createProductValidation,
  validationMiddleware,
  createProduct
);

router.put('/:id', 
  authenticateToken, 
  requireRole(['admin', 'manufacturing_manager', 'inventory_manager']), 
  updateProductValidation,
  validationMiddleware,
  updateProduct
);

router.delete('/:id', 
  authenticateToken, 
  requireRole(['admin', 'manufacturing_manager']), 
  getProductValidation,
  validationMiddleware,
  deleteProduct
);

module.exports = router;

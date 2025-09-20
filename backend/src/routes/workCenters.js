const express = require('express');
const { body, param } = require('express-validator');
const { 
  getAllWorkCenters, 
  getWorkCenterById, 
  createWorkCenter, 
  updateWorkCenter, 
  deleteWorkCenter 
} = require('../controllers/workCenterController');
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleAuth');
const { validationMiddleware } = require('../middleware/validation');

const router = express.Router();

const createWorkCenterValidation = [
  body('workCenterCode')
    .trim()
    .notEmpty()
    .withMessage('Work center code required')
    .isLength({ max: 50 })
    .withMessage('Code must be less than 50 characters'),
  body('workCenterName')
    .trim()
    .notEmpty()
    .withMessage('Work center name required')
    .isLength({ max: 100 })
    .withMessage('Name must be less than 100 characters'),
  body('costPerHour')
    .isFloat({ min: 0 })
    .withMessage('Cost per hour must be a positive number'),
  body('capacityPerHour')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Capacity must be a positive number')
];

router.get('/', authenticateToken, getAllWorkCenters);
router.get('/:id', authenticateToken, param('id').isUUID(), validationMiddleware, getWorkCenterById);
router.post('/', authenticateToken, requireRole(['admin', 'manufacturing_manager']), createWorkCenterValidation, validationMiddleware, createWorkCenter);
router.put('/:id', authenticateToken, requireRole(['admin', 'manufacturing_manager']), param('id').isUUID(), validationMiddleware, updateWorkCenter);
router.delete('/:id', authenticateToken, requireRole(['admin']), param('id').isUUID(), validationMiddleware, deleteWorkCenter);

module.exports = router;

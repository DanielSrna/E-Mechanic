import { body, param } from 'express-validator';

export const createPartValidator = [
  body('sku')
    .trim()
    .notEmpty()
    .withMessage('SKU is required')
    .matches(/^[A-Z0-9-]+$/)
    .withMessage('SKU must be alphanumeric (uppercase) with optional hyphens'),
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('brand').optional({ values: 'falsy' }).trim(),
  body('description')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be at most 1000 characters'),
  body('purchasePrice')
    .notEmpty()
    .withMessage('Purchase price is required')
    .isFloat({ min: 0 })
    .withMessage('Purchase price must be a positive number'),
  body('salePrice')
    .notEmpty()
    .withMessage('Sale price is required')
    .isFloat({ min: 0 })
    .withMessage('Sale price must be a positive number'),
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  body('minStock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Min stock must be a non-negative integer'),
];

export const updatePartValidator = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('brand').optional({ values: 'falsy' }).trim(),
  body('description')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be at most 1000 characters'),
  body('purchasePrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Purchase price must be a positive number'),
  body('salePrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Sale price must be a positive number'),
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  body('minStock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Min stock must be a non-negative integer'),
];

export const partIdValidator = [
  param('id').isMongoId().withMessage('Invalid part ID'),
];

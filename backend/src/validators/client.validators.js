import { body, param } from 'express-validator';

export const createClientValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 3 })
    .withMessage('Name must be at least 3 characters'),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone is required')
    .matches(/^\+?[0-9]{7,15}$/)
    .withMessage('Phone must be a valid number (7-15 digits)'),
  body('email')
    .optional({ values: 'falsy' })
    .trim()
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  body('address')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 500 })
    .withMessage('Address must be at most 500 characters'),
];

export const updateClientValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage('Name must be at least 3 characters'),
  body('phone')
    .optional()
    .trim()
    .matches(/^\+?[0-9]{7,15}$/)
    .withMessage('Phone must be a valid number (7-15 digits)'),
  body('email')
    .optional({ values: 'falsy' })
    .trim()
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  body('address')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 500 })
    .withMessage('Address must be at most 500 characters'),
];

export const clientIdValidator = [
  param('id').isMongoId().withMessage('Invalid client ID'),
];

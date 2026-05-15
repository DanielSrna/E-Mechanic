import { body, param } from 'express-validator';
import Motorcycle from '../models/motorcycle.model.js';
import { ORDER_STATUSES } from '../models/order.model.js';

export const createOrderValidator = [
  body('motorcycle')
    .notEmpty()
    .withMessage('Motorcycle ID is required')
    .isMongoId()
    .withMessage('Invalid motorcycle ID')
    .custom(async (value) => {
      const motorcycle = await Motorcycle.findById(value);
      if (!motorcycle) {
        throw new Error('Motorcycle not found');
      }
      return true;
    }),
  body('mechanic')
    .notEmpty()
    .withMessage('Mechanic ID is required')
    .isMongoId()
    .withMessage('Invalid mechanic ID')
    .custom(async (value) => {
      const User = (await import('../models/user.model.js')).default;
      const user = await User.findById(value);
      if (!user) {
        throw new Error('Mechanic not found');
      }
      if (user.rol !== 'mecanico' && user.rol !== 'admin') {
        throw new Error('Assigned user must have mechanic or admin role');
      }
      return true;
    }),
  body('entryReason')
    .trim()
    .notEmpty()
    .withMessage('Entry reason is required')
    .isLength({ max: 1000 })
    .withMessage('Entry reason must be at most 1000 characters'),
  body('notes')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Notes must be at most 2000 characters'),
];

export const updateStatusValidator = [
  param('id').isMongoId().withMessage('Invalid order ID'),
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(ORDER_STATUSES)
    .withMessage(`Invalid status. Valid: ${ORDER_STATUSES.join(', ')}`),
  body('diagnosis')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Diagnosis must be at most 2000 characters'),
];

export const addPartValidator = [
  param('id').isMongoId().withMessage('Invalid order ID'),
  body('partId')
    .notEmpty()
    .withMessage('Part ID is required')
    .isMongoId()
    .withMessage('Invalid part ID'),
  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
];

export const removePartValidator = [
  param('id').isMongoId().withMessage('Invalid order ID'),
  body('partId')
    .notEmpty()
    .withMessage('Part ID is required')
    .isMongoId()
    .withMessage('Invalid part ID'),
];

export const addLaborValidator = [
  param('id').isMongoId().withMessage('Invalid order ID'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('cost')
    .notEmpty()
    .withMessage('Cost is required')
    .isFloat({ min: 0 })
    .withMessage('Cost must be a positive number'),
];

export const removeLaborValidator = [
  param('id').isMongoId().withMessage('Invalid order ID'),
  body('index')
    .notEmpty()
    .withMessage('Labor index is required')
    .isInt({ min: 0 })
    .withMessage('Index must be a non-negative integer'),
];

export const orderIdValidator = [
  param('id').isMongoId().withMessage('Invalid order ID'),
];

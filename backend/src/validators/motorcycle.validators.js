import { body, param, query } from 'express-validator';
import Client from '../models/client.model.js';
import Motorcycle from '../models/motorcycle.model.js';

const currentYear = new Date().getFullYear();

export const createMotorcycleValidator = [
  body('plate')
    .trim()
    .notEmpty()
    .withMessage('Plate is required')
    .matches(/^[A-Z0-9]{3,10}$/)
    .withMessage('Plate must be 3-10 alphanumeric characters')
    .custom(async (value) => {
      const existing = await Motorcycle.findOne({ plate: value.toUpperCase() });
      if (existing) {
        throw new Error('Plate already registered in the system');
      }
      return true;
    }),
  body('brand').trim().notEmpty().withMessage('Brand is required'),
  body('model').trim().notEmpty().withMessage('Model is required'),
  body('year')
    .notEmpty()
    .withMessage('Year is required')
    .isInt({ min: 1950, max: currentYear + 1 })
    .withMessage(`Year must be between 1950 and ${currentYear + 1}`),
  body('mileage')
    .notEmpty()
    .withMessage('Mileage is required')
    .isInt({ min: 0 })
    .withMessage('Mileage must be a positive number'),
  body('client')
    .notEmpty()
    .withMessage('Client ID is required')
    .isMongoId()
    .withMessage('Invalid client ID')
    .custom(async (value) => {
      const client = await Client.findById(value);
      if (!client) {
        throw new Error('Client not found');
      }
      return true;
    }),
];

export const updateMotorcycleValidator = [
  body('plate')
    .optional()
    .trim()
    .matches(/^[A-Z0-9]{3,10}$/)
    .withMessage('Plate must be 3-10 alphanumeric characters')
    .custom(async (value, { req }) => {
      const existing = await Motorcycle.findOne({
        plate: value.toUpperCase(),
        _id: { $ne: req.params.id },
      });
      if (existing) {
        throw new Error('Plate already registered in the system');
      }
      return true;
    }),
  body('brand')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Brand cannot be empty'),
  body('model')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Model cannot be empty'),
  body('year')
    .optional()
    .isInt({ min: 1950, max: currentYear + 1 })
    .withMessage(`Year must be between 1950 and ${currentYear + 1}`),
  body('mileage')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Mileage must be a positive number'),
  body('client')
    .optional()
    .isMongoId()
    .withMessage('Invalid client ID')
    .custom(async (value) => {
      const client = await Client.findById(value);
      if (!client) {
        throw new Error('Client not found');
      }
      return true;
    }),
];

export const motorcycleIdValidator = [
  param('id').isMongoId().withMessage('Invalid motorcycle ID'),
];

export const motorcyclePlateQueryValidator = [
  query('plate')
    .optional()
    .trim()
    .matches(/^[A-Z0-9]{3,10}$/)
    .withMessage('Plate must be 3-10 alphanumeric characters'),
];

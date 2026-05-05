import { body } from 'express-validator';
import User from '../models/user.model.js';

export const registerValidator = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2 }).withMessage('Name must be at least 2 characters long'),
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail()
        // NUEVA REGLA: Consulta a la BD
        .custom(async (value) => {
            const existingUser = await User.findOne({ email: value });
            if (existingUser) {
                throw new Error('El correo electrónico ya está registrado');
            }
            return true;
        }),
    body('cedula')
        .trim()
        .notEmpty().withMessage('Cedula is required')
        .matches(/^[0-9]{6,10}$/).withMessage('Cedula must be a valid number between 6 and 10 digits')
        // NUEVA REGLA: Consulta a la BD
        .custom(async (value) => {
            const existingUser = await User.findOne({ cedula: value });
            if (existingUser) {
                throw new Error('La cédula ya se encuentra registrada en el sistema');
            }
            return true;
        }),  
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body("passwordConfirmation")
        .trim()
        .notEmpty().withMessage('Password confirmation is required')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords do not match');
            }
            return true;
        })
];

export const loginValidator = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail(),
    body('password')
        .trim()
        .notEmpty().withMessage('Password is required')
];
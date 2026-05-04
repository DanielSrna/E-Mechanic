import {body} from 'express-validator';

export const registerValidator = [
    body('name')
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2 }).withMessage('Name must be at least 2 characters long'),
    body('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format'),
    body('cedula')
        .notEmpty().withMessage('Cedula is required')
        .isNumeric().withMessage('Cedula must be a number')
        .matches(/^[0-9]{6,10}$/).withMessage('Cedula must be between 6 and 10 digits'),
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
];
import express from 'express';
const router = express.Router();
import * as userController from './user.controller.js';
import { validate } from '../../middlewares/validatorErrorHandler.js';
import { registerValidator } from './user.validators.js';

router.route("/registro")
    .post([...registerValidator, validate], userController.createUser);

export default router;
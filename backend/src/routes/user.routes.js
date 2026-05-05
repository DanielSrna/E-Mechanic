import express from 'express';
const router = express.Router();
import * as userController from '../controllers/user.controller.js';
import { validate } from '../middlewares/validatorErrorHandler.js';
import { registerValidator, loginValidator } from '../validators/user.validators.js';

router.route("/registro")
    .post([...registerValidator, validate], userController.register);

router.route("/login")
    .post([...loginValidator, validate], userController.login);

export default router;
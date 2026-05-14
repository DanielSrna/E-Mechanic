import express from 'express';
const router = express.Router();
import * as userController from '../controllers/user.controller.js';
import { validate } from '../middlewares/validatorErrorHandler.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { authLimiter } from '../middlewares/rateLimiter.middleware.js';
import {
  registerValidator,
  loginValidator,
} from '../validators/user.validators.js';

/**
 * @swagger
 * /api/users/registro:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, cedula, password, passwordConfirmation]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               cedula:
 *                 type: string
 *               password:
 *                 type: string
 *               passwordConfirmation:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *       400:
 *         description: Error de validación
 */
router
  .route('/registro')
  .post([authLimiter, ...registerValidator, validate], userController.register);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login exitoso, devuelve accessToken y cookie httpOnly con refreshToken
 *       401:
 *         description: Credenciales inválidas
 */
router
  .route('/login')
  .post([authLimiter, ...loginValidator, validate], userController.login);

/**
 * @swagger
 * /api/users/refresh-token:
 *   post:
 *     summary: Refrescar access token usando refresh token de la cookie
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Nuevo access token generado
 *       401:
 *         description: Refresh token inválido o expirado
 */
router.route('/refresh-token').post(userController.refreshToken);

/**
 * @swagger
 * /api/users/logout:
 *   post:
 *     summary: Cerrar sesión (revoca refresh token y limpia cookie)
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Sesión cerrada exitosamente
 */
router.route('/logout').post(userController.logout);

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Obtener perfil del usuario autenticado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario
 *       401:
 *         description: No autenticado
 */
router.route('/me').get(verifyToken, userController.getMe);

export default router;

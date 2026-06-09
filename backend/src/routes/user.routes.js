import express from 'express';
const router = express.Router();
import * as userController from '../controllers/user.controller.js';
import { validate } from '../middlewares/validatorErrorHandler.js';
import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';
import { uploadSingle } from '../middlewares/upload.middleware.js';
import { deleteFile } from '../services/storage.service.js';
import { authLimiter } from '../middlewares/rateLimiter.middleware.js';
import {
  registerValidator,
  loginValidator,
} from '../validators/user.validators.js';

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

router.route('/refresh-token').post(userController.refreshToken);
router.route('/logout').post(userController.logout);
router.route('/me').get(verifyToken, userController.getMe);

router.route('/verify-email').get(userController.verifyEmail);

router.use(verifyToken);

router
  .route('/')
  .get(requireRole('admin'), userController.getMechanics)
  .post(
    requireRole('admin'),
    registerValidator,
    validate,
    userController.createMechanic
  );

router.route('/change-password').put(userController.changePassword);
router.route('/change-email').put(userController.changeEmail);

router
  .route('/:id')
  .get(requireRole('admin'), userController.getMechanicById)
  .put(requireRole('admin'), userController.updateMechanic);

router
  .route('/:id/fire')
  .put(requireRole('admin'), userController.fireMechanic);

router
  .route('/:id/rehire')
  .put(requireRole('admin'), userController.rehireMechanic);

router
  .route('/:id/photo')
  .post(
    requireRole('admin'),
    uploadSingle('photo', 'users'),
    async (req, res, next) => {
      try {
        const User = (await import('../models/user.model.js')).default;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.photo) await deleteFile(user.photo);
        user.photo = req.uploadedFileUrl;
        await user.save();
        res.status(200).json({ message: 'Photo uploaded', photo: user.photo });
      } catch (error) {
        next(error);
      }
    }
  );

export default router;

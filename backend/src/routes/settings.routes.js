import express from 'express';
const router = express.Router();
import * as settingsController from '../controllers/settings.controller.js';
import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';
import { uploadSingle } from '../middlewares/upload.middleware.js';

router.use(verifyToken);

/**
 * @swagger
 * /api/settings:
 *   get:
 *     summary: Obtener configuración del sistema (colores, nombre, logo)
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Configuración del sistema
 */
router
  .route('/')
  .get(requireRole('admin', 'mecanico'), settingsController.getSettings)
  .put(requireRole('admin'), settingsController.updateSettings);

/**
 * @swagger
 * /api/settings/logo:
 *   post:
 *     summary: Subir logo del taller
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               logo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Logo actualizado
 */
router
  .route('/logo')
  .post(
    requireRole('admin'),
    uploadSingle('logo', 'logos'),
    settingsController.uploadLogo
  );

export default router;

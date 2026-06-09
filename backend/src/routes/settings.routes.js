import express from 'express';
const router = express.Router();
import * as settingsController from '../controllers/settings.controller.js';
import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';
import { uploadSingle } from '../middlewares/upload.middleware.js';
import { validate } from '../middlewares/validatorErrorHandler.js';
import { body } from 'express-validator';

const settingsValidator = [
  body('appName').optional().trim().isLength({ max: 100 }).withMessage('App name max 100 chars'),
  body('primaryColor').optional().matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Invalid hex color'),
  body('secondaryColor').optional().matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Invalid hex color'),
  body('accentColor').optional().matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Invalid hex color'),
  body('companyName').optional().trim().isLength({ max: 200 }),
  body('companyNit').optional().trim().isLength({ max: 50 }),
  body('companyPhone').optional().trim().isLength({ max: 30 }),
  body('companyAddress').optional().trim().isLength({ max: 300 }),
  body('companyEmail').optional().isEmail().normalizeEmail(),
  body('dailyCapacityUnits').optional().isFloat({ min: 0.5 }),
  body('serviceTypes').optional().isArray(),
];

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
  .put(requireRole('admin'), settingsValidator, validate, settingsController.updateSettings);

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

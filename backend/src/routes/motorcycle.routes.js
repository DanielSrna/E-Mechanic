import express from 'express';
const router = express.Router();
import * as motorcycleController from '../controllers/motorcycle.controller.js';
import Motorcycle from '../models/motorcycle.model.js';
import logger from '../utils/logger.js';
import { validate } from '../middlewares/validatorErrorHandler.js';
import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';
import { uploadMultiple } from '../middlewares/upload.middleware.js';
import { deleteFile } from '../services/storage.service.js';
import {
  createMotorcycleValidator,
  updateMotorcycleValidator,
  motorcycleIdValidator,
  motorcyclePlateQueryValidator,
} from '../validators/motorcycle.validators.js';

router.use(verifyToken);

/**
 * @swagger
 * components:
 *   schemas:
 *     Motorcycle:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         plate:
 *           type: string
 *         brand:
 *           type: string
 *         model:
 *           type: string
 *         year:
 *           type: number
 *         mileage:
 *           type: number
 *         client:
 *           $ref: '#/components/schemas/Client'
 *         createdAt:
 *           type: string
 *         updatedAt:
 *           type: string
 */

/**
 * @swagger
 * /api/motorcycles:
 *   post:
 *     summary: Registrar una nueva motocicleta
 *     tags: [Motorcycles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [plate, brand, model, year, mileage, client]
 *             properties:
 *               plate:
 *                 type: string
 *               brand:
 *                 type: string
 *               model:
 *                 type: string
 *               year:
 *                 type: number
 *               mileage:
 *                 type: number
 *               client:
 *                 type: string
 *                 description: ID del cliente
 *     responses:
 *       201:
 *         description: Motocicleta creada
 */
router
  .route('/')
  .post(
    requireRole('admin'),
    createMotorcycleValidator,
    validate,
    motorcycleController.createMotorcycle
  );

/**
 * @swagger
 * /api/motorcycles:
 *   get:
 *     summary: Listar motocicletas (con búsqueda por placa)
 *     tags: [Motorcycles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: plate
 *         schema:
 *           type: string
 *         description: Buscar por placa exacta
 *       - in: query
 *         name: clientId
 *         schema:
 *           type: string
 *         description: Filtrar por cliente
 *     responses:
 *       200:
 *         description: Lista de motocicletas
 */
router
  .route('/')
  .get(
    requireRole('admin', 'mecanico'),
    motorcyclePlateQueryValidator,
    validate,
    motorcycleController.getMotorcycles
  );

/**
 * @swagger
 * /api/motorcycles/{id}:
 *   get:
 *     summary: Obtener motocicleta por ID
 *     tags: [Motorcycles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Motocicleta encontrada
 */
router
  .route('/:id')
  .get(
    requireRole('admin', 'mecanico'),
    motorcycleIdValidator,
    validate,
    motorcycleController.getMotorcycleById
  );

/**
 * @swagger
 * /api/motorcycles/{id}:
 *   put:
 *     summary: Actualizar motocicleta
 *     tags: [Motorcycles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Motocicleta actualizada
 */
router
  .route('/:id')
  .put(
    requireRole('admin'),
    motorcycleIdValidator,
    updateMotorcycleValidator,
    validate,
    motorcycleController.updateMotorcycle
  );

/**
 * @swagger
 * /api/motorcycles/{id}:
 *   delete:
 *     summary: Eliminar motocicleta
 *     tags: [Motorcycles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Motocicleta eliminada
 */
router
  .route('/:id')
  .delete(
    requireRole('admin'),
    motorcycleIdValidator,
    validate,
    motorcycleController.deleteMotorcycle
  );

/**
 * @swagger
 * /api/motorcycles/{id}/history:
 *   get:
 *     summary: Historial clínico de la motocicleta (todas las órdenes de trabajo)
 *     tags: [Motorcycles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Historial de órdenes
 */
router
  .route('/:id/history')
  .get(
    requireRole('admin', 'mecanico'),
    motorcycleIdValidator,
    validate,
    motorcycleController.getMotorcycleHistory
  );

router.post(
  '/:id/images',
  requireRole('admin', 'mecanico'),
  uploadMultiple('images', 5, 'motorcycles'),
  async (req, res, next) => {
    try {
      const motorcycle = await Motorcycle.findById(req.params.id);
      if (!motorcycle)
        return res.status(404).json({ message: 'Motorcycle not found' });

      const newImages = req.uploadedFileUrls || [];
      motorcycle.images = [...motorcycle.images, ...newImages];
      await motorcycle.save();

      logger.exito('%d imágenes agregadas a moto %s', newImages.length, motorcycle.plate);
      res.status(200).json({ message: 'Images uploaded', motorcycle });
    } catch (error) {
      logger.fracaso('Error al subir imágenes de moto: ', error);
      next(error);
    }
  }
);

router.delete(
  '/:id/images/:index',
  requireRole('admin'),
  async (req, res, next) => {
    try {
      const motorcycle = await Motorcycle.findById(req.params.id);
      if (!motorcycle)
        return res.status(404).json({ message: 'Motorcycle not found' });

      const index = parseInt(req.params.index, 10);
      if (index < 0 || index >= motorcycle.images.length) {
        return res.status(400).json({ message: 'Invalid image index' });
      }

      const removed = motorcycle.images.splice(index, 1)[0];
      await deleteFile(removed);
      await motorcycle.save();

      logger.exito('Imagen eliminada de moto %s', motorcycle.plate);
      res.status(200).json({ message: 'Image deleted', motorcycle });
    } catch (error) {
      logger.fracaso('Error al eliminar imagen: ', error);
      next(error);
    }
  }
);

export default router;

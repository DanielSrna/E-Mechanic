import express from 'express';
const router = express.Router();
import Motorcycle from '../models/motorcycle.model.js';
import logger from '../utils/logger.js';
import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';
import { uploadMultiple } from '../middlewares/upload.middleware.js';
import { deleteFile } from '../services/storage.service.js';

router.use(verifyToken);

/**
 * @swagger
 * /api/motorcycles/{id}/images:
 *   post:
 *     summary: Subir imágenes de la motocicleta recibida
 *     tags: [Motorcycles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Imágenes subidas
 */
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

      logger.exito(
        '%d imágenes agregadas a moto %s',
        newImages.length,
        motorcycle.plate
      );
      res.status(200).json({ message: 'Images uploaded', motorcycle });
    } catch (error) {
      logger.fracaso('Error al subir imágenes de moto: ', error);
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/motorcycles/{id}/images/{index}:
 *   delete:
 *     summary: Eliminar imagen de la motocicleta
 *     tags: [Motorcycles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: index
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Imagen eliminada
 */
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

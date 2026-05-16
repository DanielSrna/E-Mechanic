import express from 'express';
const router = express.Router();
import Part from '../models/part.model.js';
import logger from '../utils/logger.js';
import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';
import { uploadSingle } from '../middlewares/upload.middleware.js';
import fs from 'fs';

router.use(verifyToken);

/**
 * @swagger
 * /api/parts/{id}/image:
 *   post:
 *     summary: Subir imagen del repuesto
 *     tags: [Inventory]
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
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Imagen actualizada
 */
router.post(
  '/:id/image',
  requireRole('admin'),
  uploadSingle('image', 'parts'),
  async (req, res, next) => {
    try {
      const part = await Part.findById(req.params.id);
      if (!part) return res.status(404).json({ message: 'Part not found' });

      if (part.image) {
        try {
          fs.unlinkSync(part.image);
        } catch {
          /* old image may not exist */
        }
      }

      part.image = req.file.path;
      await part.save();

      logger.exito('Imagen de repuesto actualizada: %s', part.name);
      res.status(200).json({ message: 'Image uploaded', part });
    } catch (error) {
      logger.fracaso('Error al subir imagen de repuesto: ', error);
      next(error);
    }
  }
);

export default router;

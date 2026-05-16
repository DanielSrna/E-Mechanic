import express from 'express';
const router = express.Router();
import Part from '../models/part.model.js';
import logger from '../utils/logger.js';
import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';
import { uploadSingle } from '../middlewares/upload.middleware.js';
import { deleteFile } from '../services/storage.service.js';

router.use(verifyToken);

router.post(
  '/:id/image',
  requireRole('admin'),
  uploadSingle('image', 'parts'),
  async (req, res, next) => {
    try {
      const part = await Part.findById(req.params.id);
      if (!part) return res.status(404).json({ message: 'Part not found' });

      if (part.image) {
        await deleteFile(part.image);
      }

      part.image = req.uploadedFileUrl;
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

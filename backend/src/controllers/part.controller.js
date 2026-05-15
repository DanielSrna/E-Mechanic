import Part from '../models/part.model.js';
import logger from '../utils/logger.js';

export const createPart = async (req, res, next) => {
  logger.contexto('Iniciando controlador createPart');

  try {
    const {
      sku,
      name,
      brand,
      description,
      purchasePrice,
      salePrice,
      stock,
      minStock,
    } = req.body;

    logger.proceso('Verificando SKU duplicado...');
    const existing = await Part.findOne({ sku: sku.toUpperCase() });
    if (existing) {
      return res.status(409).json({
        message: `Part with SKU '${sku.toUpperCase()}' already exists`,
        part: existing,
      });
    }

    logger.proceso('Creando repuesto en la base de datos...');
    const part = await Part.create({
      sku,
      name,
      brand,
      description,
      purchasePrice,
      salePrice,
      stock: stock ?? 0,
      minStock: minStock ?? 5,
    });

    logger.exito('Repuesto creado: %s (%s)', part.name, part.sku);

    res.status(201).json({
      message: 'Part created successfully',
      part,
    });
  } catch (error) {
    logger.fracaso('Error al crear repuesto: ', error);
    next(error);
  }
};

export const getParts = async (req, res, next) => {
  logger.contexto('Iniciando controlador getParts');

  try {
    const { search, lowStock } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
      ];
    }

    if (lowStock === 'true') {
      filter.$expr = { $lte: ['$stock', '$minStock'] };
    }

    logger.proceso('Consultando repuestos con filtros...');
    const parts = await Part.find(filter).sort({ name: 1 }).lean();

    logger.exito('Repuestos obtenidos: %d encontrados', parts.length);

    res.status(200).json({
      count: parts.length,
      parts,
    });
  } catch (error) {
    logger.fracaso('Error al obtener repuestos: ', error);
    next(error);
  }
};

export const getPartById = async (req, res, next) => {
  logger.contexto('Iniciando controlador getPartById');

  try {
    const { id } = req.params;

    logger.proceso('Buscando repuesto por ID...');
    const part = await Part.findById(id).lean();

    if (!part) {
      return res.status(404).json({ message: 'Part not found' });
    }

    logger.exito('Repuesto encontrado: %s', part.name);

    res.status(200).json({ part });
  } catch (error) {
    logger.fracaso('Error al obtener repuesto: ', error);
    next(error);
  }
};

export const updatePart = async (req, res, next) => {
  logger.contexto('Iniciando controlador updatePart');

  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.sku) {
      updateData.sku = updateData.sku.toUpperCase();
    }

    logger.proceso('Actualizando repuesto...');
    const part = await Part.findByIdAndUpdate(id, updateData, {
      returnDocument: 'after',
      runValidators: true,
    });

    if (!part) {
      return res.status(404).json({ message: 'Part not found' });
    }

    logger.exito('Repuesto actualizado: %s', part.name);

    res.status(200).json({
      message: 'Part updated successfully',
      part,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'SKU already exists. Use a different SKU.',
      });
    }
    logger.fracaso('Error al actualizar repuesto: ', error);
    next(error);
  }
};

export const deletePart = async (req, res, next) => {
  logger.contexto('Iniciando controlador deletePart');

  try {
    const { id } = req.params;

    logger.proceso('Eliminando repuesto...');
    const part = await Part.findByIdAndDelete(id);

    if (!part) {
      return res.status(404).json({ message: 'Part not found' });
    }

    logger.exito('Repuesto eliminado: %s (%s)', part.name, part.sku);

    res.status(200).json({ message: 'Part deleted successfully' });
  } catch (error) {
    logger.fracaso('Error al eliminar repuesto: ', error);
    next(error);
  }
};

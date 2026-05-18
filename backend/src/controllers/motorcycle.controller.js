import Motorcycle from '../models/motorcycle.model.js';
import Order from '../models/order.model.js';
import logger from '../utils/logger.js';
import { paginate, paginatedResponse } from '../utils/pagination.js';

export const createMotorcycle = async (req, res, next) => {
  logger.contexto('Iniciando controlador createMotorcycle');

  try {
    const { plate, brand, model, year, mileage, client } = req.body;

    logger.proceso('Creando nueva motocicleta en la base de datos...');
    const motorcycle = new Motorcycle({
      plate,
      brand,
      model,
      year,
      mileage,
      client,
    });
    await motorcycle.save();

    const populated = await motorcycle.populate('client', 'name phone email');
    logger.exito(
      'Motocicleta creada: %s %s %s',
      populated.brand,
      populated.model,
      populated.plate
    );

    res.status(201).json({
      message: 'Motorcycle created successfully',
      motorcycle: populated,
    });
  } catch (error) {
    logger.fracaso('Error al crear motocicleta: ', error);
    next(error);
  }
};

export const getMotorcycles = async (req, res, next) => {
  logger.contexto('Iniciando controlador getMotorcycles');

  try {
    const { plate, clientId, page: p, limit: l } = req.query;
    const filter = {};
    const pager = paginate({}, { page: p, limit: l });

    if (plate) filter.plate = plate.toUpperCase();
    if (clientId) filter.client = clientId;

    logger.proceso('Consultando motocicletas...');
    const [motorcycles, total] = await Promise.all([
      Motorcycle.find(filter)
        .populate('client', 'name phone email')
        .sort({ createdAt: -1 })
        .skip(pager.skip)
        .limit(pager.limit)
        .lean(),
      Motorcycle.countDocuments(filter),
    ]);

    logger.exito('Motocicletas obtenidas: %d encontradas', motorcycles.length);

    res.status(200).json({
      ...paginatedResponse(motorcycles, total, pager),
      motorcycles,
    });
  } catch (error) {
    logger.fracaso('Error al obtener motocicletas: ', error);
    next(error);
  }
};

export const getMotorcycleById = async (req, res, next) => {
  logger.contexto('Iniciando controlador getMotorcycleById');

  try {
    const { id } = req.params;

    logger.proceso('Buscando motocicleta por ID...');
    const motorcycle = await Motorcycle.findById(id)
      .populate('client', 'name phone email')
      .lean();

    if (!motorcycle) {
      return res.status(404).json({ message: 'Motorcycle not found' });
    }

    logger.exito(
      'Motocicleta encontrada: %s %s',
      motorcycle.brand,
      motorcycle.model
    );

    res.status(200).json({ motorcycle });
  } catch (error) {
    logger.fracaso('Error al obtener motocicleta: ', error);
    next(error);
  }
};

export const updateMotorcycle = async (req, res, next) => {
  logger.contexto('Iniciando controlador updateMotorcycle');

  try {
    const { id } = req.params;

    logger.proceso('Actualizando motocicleta...');
    const motorcycle = await Motorcycle.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).populate('client', 'name phone email');

    if (!motorcycle) {
      return res.status(404).json({ message: 'Motorcycle not found' });
    }

    logger.exito(
      'Motocicleta actualizada: %s %s %s',
      motorcycle.brand,
      motorcycle.model,
      motorcycle.plate
    );

    res.status(200).json({
      message: 'Motorcycle updated successfully',
      motorcycle,
    });
  } catch (error) {
    logger.fracaso('Error al actualizar motocicleta: ', error);
    next(error);
  }
};

export const deleteMotorcycle = async (req, res, next) => {
  logger.contexto('Iniciando controlador deleteMotorcycle');

  try {
    const { id } = req.params;

    const linkedOrders = await Order.countDocuments({ motorcycle: id });
    if (linkedOrders > 0) {
      return res.status(409).json({
        message: `Cannot delete motorcycle: has ${linkedOrders} work order(s) associated.`,
      });
    }

    logger.proceso('Eliminando motocicleta...');
    const motorcycle = await Motorcycle.findByIdAndDelete(id);

    if (!motorcycle) {
      return res.status(404).json({ message: 'Motorcycle not found' });
    }

    logger.exito(
      'Motocicleta eliminada: %s %s',
      motorcycle.brand,
      motorcycle.model
    );

    res.status(200).json({ message: 'Motorcycle deleted successfully' });
  } catch (error) {
    logger.fracaso('Error al eliminar motocicleta: ', error);
    next(error);
  }
};

export const getMotorcycleHistory = async (req, res, next) => {
  logger.contexto('Iniciando controlador getMotorcycleHistory');

  try {
    const { id } = req.params;

    logger.proceso('Verificando existencia de la motocicleta...');
    const motorcycle = await Motorcycle.findById(id)
      .populate('client', 'name phone email')
      .lean();

    if (!motorcycle) {
      return res.status(404).json({ message: 'Motorcycle not found' });
    }

    let workOrders = [];
    try {
      const WorkOrder = (await import('../models/order.model.js')).default;
      workOrders = await WorkOrder.find({ motorcycle: id })
        .populate('mechanic', 'name')
        .sort({ createdAt: -1 })
        .lean();
    } catch {
      logger.proceso('Modelo de órdenes no disponible aún. Historial vacío.');
    }

    logger.exito(
      'Historial de %s %s: %d órdenes encontradas',
      motorcycle.brand,
      motorcycle.model,
      workOrders.length
    );

    res.status(200).json({
      motorcycle,
      history: workOrders,
    });
  } catch (error) {
    logger.fracaso('Error al obtener historial: ', error);
    next(error);
  }
};

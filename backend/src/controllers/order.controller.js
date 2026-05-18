import mongoose from 'mongoose';
import Order from '../models/order.model.js';
import Motorcycle from '../models/motorcycle.model.js';
import Part from '../models/part.model.js';
import logger from '../utils/logger.js';
import eventEmitter from '../events/eventEmitter.js';

const TAX_RATE = 0.19;

export const createOrder = async (req, res, next) => {
  logger.contexto('Iniciando controlador createOrder');

  try {
    const { motorcycle, mechanic, entryReason, notes } = req.body;

    logger.proceso('Verificando motocicleta...');
    const moto = await Motorcycle.findById(motorcycle).populate('client');
    if (!moto) {
      return res.status(404).json({ message: 'Motorcycle not found' });
    }

    logger.proceso('Creando orden de trabajo...');
    const order = new Order({
      motorcycle: moto._id,
      client: moto.client._id,
      mechanic,
      entryReason,
      notes,
    });
    await order.save();

    const populated = await Order.findById(order._id)
      .populate('motorcycle', 'plate brand model year')
      .populate('client', 'name phone')
      .populate('mechanic', 'name email');

    logger.exito(
      'Orden creada: %s - Moto: %s %s',
      populated._id,
      populated.motorcycle.brand,
      populated.motorcycle.model
    );

    res.status(201).json({
      message: 'Work order created successfully',
      order: populated,
    });
  } catch (error) {
    logger.fracaso('Error al crear orden: ', error);
    next(error);
  }
};

export const getOrders = async (req, res, next) => {
  logger.contexto('Iniciando controlador getOrders');

  try {
    const { status, mechanic, motorcycle, from, to } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (mechanic) filter.mechanic = mechanic;
    if (motorcycle) filter.motorcycle = motorcycle;
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    logger.proceso('Consultando órdenes con filtros: %o', filter);
    const orders = await Order.find(filter)
      .populate('motorcycle', 'plate brand model year')
      .populate('client', 'name phone')
      .populate('mechanic', 'name')
      .sort({ createdAt: -1 })
      .lean();

    logger.exito('Órdenes obtenidas: %d encontradas', orders.length);

    res.status(200).json({
      count: orders.length,
      orders,
    });
  } catch (error) {
    logger.fracaso('Error al obtener órdenes: ', error);
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  logger.contexto('Iniciando controlador getOrderById');

  try {
    const { id } = req.params;

    logger.proceso('Buscando orden por ID...');
    const order = await Order.findById(id)
      .populate('motorcycle', 'plate brand model year mileage')
      .populate('client', 'name phone email')
      .populate('mechanic', 'name email')
      .populate('partsUsed.part', 'sku name brand salePrice')
      .lean();

    if (!order) {
      return res.status(404).json({ message: 'Work order not found' });
    }

    logger.exito('Orden encontrada: %s', order._id);

    res.status(200).json({ order });
  } catch (error) {
    logger.fracaso('Error al obtener orden: ', error);
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  logger.contexto('Iniciando controlador updateOrderStatus');
  try {
    const { id } = req.params;
    const { status, diagnosis } = req.body;
    logger.proceso('Buscando orden...');
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Work order not found' });
    }
    if (order.isClosed) {
      return res
        .status(400)
        .json({ message: 'Cannot modify a closed work order' });
    }
    const currentStatus = order.status;
    if (currentStatus === status) {
      return res
        .status(400)
        .json({ message: 'Order is already in this status' });
    }
    order.status = status;
    if (diagnosis !== undefined) order.diagnosis = diagnosis;
    await order.save();
    const populated = await Order.findById(order._id)
      .populate('motorcycle', 'plate brand model')
      .populate('mechanic', 'name');
    logger.exito('Estado actualizado: %s → %s', currentStatus, status);
    res.status(200).json({
      message: 'Order status updated successfully',
      order: populated,
    });
  } catch (error) {
    logger.fracaso('Error al actualizar estado: ', error);
    next(error);
  }
};

export const addPartToOrder = async (req, res, next) => {
  logger.contexto('Iniciando controlador addPartToOrder');

  const session = await mongoose.startSession();

  try {
    const { id } = req.params;
    const { partId, quantity } = req.body;

    session.startTransaction();

    const order = await Order.findById(id).session(session);
    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Work order not found' });
    }

    if (order.isClosed) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ message: 'Cannot modify a closed work order' });
    }

    const part = await Part.findById(partId).session(session);
    if (!part) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Part not found' });
    }

    if (part.stock < quantity) {
      await session.abortTransaction();
      logger.fracaso(
        'Stock insuficiente para %s: %d solicitado, %d disponible',
        part.name,
        quantity,
        part.stock
      );
      return res.status(400).json({
        message: `Insufficient stock: ${quantity} requested, ${part.stock} available`,
      });
    }

    const existingIndex = order.partsUsed.findIndex(
      (p) => p.part.toString() === partId.toString()
    );

    if (existingIndex >= 0) {
      order.partsUsed[existingIndex].quantity += quantity;
    } else {
      order.partsUsed.push({
        part: part._id,
        quantity,
        unitPrice: part.salePrice,
      });
    }

    part.stock -= quantity;
    await part.save({ session });
    await order.save({ session });

    await session.commitTransaction();

    if (part.stock <= part.minStock) {
      eventEmitter.emit('inventory:low-stock', {
        partId: part._id,
        sku: part.sku,
        name: part.name,
        stock: part.stock,
        minStock: part.minStock,
      });
    }

    const populated = await Order.findById(order._id)
      .populate('partsUsed.part', 'sku name')
      .populate('motorcycle', 'plate');

    logger.exito(
      'Repuesto agregado: %s x%d a orden %s',
      part.name,
      quantity,
      populated._id
    );

    res.status(200).json({
      message: 'Part added to order successfully',
      order: populated,
    });
  } catch (error) {
    await session.abortTransaction();
    logger.fracaso('Error al agregar repuesto: ', error);
    next(error);
  } finally {
    session.endSession();
  }
};

export const removePartFromOrder = async (req, res, next) => {
  logger.contexto('Iniciando controlador removePartFromOrder');

  const session = await mongoose.startSession();

  try {
    const { id } = req.params;
    const { partId } = req.body;

    session.startTransaction();

    const order = await Order.findById(id).session(session);
    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Work order not found' });
    }

    if (order.isClosed) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ message: 'Cannot modify a closed work order' });
    }

    const partIndex = order.partsUsed.findIndex(
      (p) => p.part.toString() === partId.toString()
    );

    if (partIndex === -1) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Part not found in this order' });
    }

    const removedPart = order.partsUsed[partIndex];
    const removedQuantity = removedPart.quantity;

    const part = await Part.findById(partId).session(session);
    if (part) {
      part.stock += removedQuantity;
      await part.save({ session });
    }

    order.partsUsed.splice(partIndex, 1);
    await order.save({ session });

    await session.commitTransaction();

    const populated = await Order.findById(order._id)
      .populate('partsUsed.part', 'sku name')
      .populate('motorcycle', 'plate');

    logger.exito(
      'Repuesto removido de orden %s. Stock devuelto: %d',
      populated._id,
      removedQuantity
    );

    res.status(200).json({
      message: 'Part removed from order successfully',
      order: populated,
    });
  } catch (error) {
    await session.abortTransaction();
    logger.fracaso('Error al remover repuesto: ', error);
    next(error);
  } finally {
    session.endSession();
  }
};

export const addLaborToOrder = async (req, res, next) => {
  logger.contexto('Iniciando controlador addLaborToOrder');

  try {
    const { id } = req.params;
    const { description, cost } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Work order not found' });
    }

    if (order.isClosed) {
      return res
        .status(400)
        .json({ message: 'Cannot modify a closed work order' });
    }

    order.labor.push({ description, cost });
    await order.save();

    const populated = await Order.findById(order._id).populate(
      'motorcycle',
      'plate'
    );

    logger.exito(
      'Mano de obra agregada a orden %s: %s',
      populated._id,
      description
    );

    res.status(200).json({
      message: 'Labor added to order successfully',
      order: populated,
    });
  } catch (error) {
    logger.fracaso('Error al agregar mano de obra: ', error);
    next(error);
  }
};

export const removeLaborFromOrder = async (req, res, next) => {
  logger.contexto('Iniciando controlador removeLaborFromOrder');

  try {
    const { id } = req.params;
    const { index } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Work order not found' });
    }

    if (order.isClosed) {
      return res
        .status(400)
        .json({ message: 'Cannot modify a closed work order' });
    }

    if (index < 0 || index >= order.labor.length) {
      return res.status(400).json({
        message: `Invalid labor index. Valid range: 0-${order.labor.length - 1}`,
      });
    }

    order.labor.splice(index, 1);
    await order.save();

    logger.exito('Mano de obra removida de orden %s', order._id);

    res.status(200).json({
      message: 'Labor removed from order successfully',
      order,
    });
  } catch (error) {
    logger.fracaso('Error al remover mano de obra: ', error);
    next(error);
  }
};

export const addFindingToOrder = async (req, res, next) => {
  logger.contexto('Iniciando controlador addFindingToOrder');
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    const order = await Order.findById(id);
    if (!order)
      return res.status(404).json({ message: 'Work order not found' });
    if (order.isClosed)
      return res
        .status(400)
        .json({ message: 'Cannot modify a closed work order' });

    order.findings.push({ title, description });
    await order.save();
    logger.exito('Hallazgo agregado a orden %s: %s', order._id, title);
    res.status(200).json({ message: 'Finding added', order });
  } catch (error) {
    logger.fracaso('Error al agregar hallazgo: ', error);
    next(error);
  }
};

export const removeFindingFromOrder = async (req, res, next) => {
  logger.contexto('Iniciando controlador removeFindingFromOrder');
  try {
    const { id } = req.params;
    const { index } = req.body;
    const order = await Order.findById(id);
    if (!order)
      return res.status(404).json({ message: 'Work order not found' });
    if (order.isClosed)
      return res
        .status(400)
        .json({ message: 'Cannot modify a closed work order' });
    if (index < 0 || index >= order.findings.length) {
      return res.status(400).json({
        message: `Invalid finding index. Valid: 0-${order.findings.length - 1}`,
      });
    }
    order.findings.splice(index, 1);
    await order.save();
    logger.exito('Hallazgo removido de orden %s', order._id);
    res.status(200).json({ message: 'Finding removed', order });
  } catch (error) {
    logger.fracaso('Error al remover hallazgo: ', error);
    next(error);
  }
};

export const closeOrder = async (req, res, next) => {
  logger.contexto('Iniciando controlador closeOrder');

  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Work order not found' });
    }

    if (order.isClosed) {
      return res.status(400).json({ message: 'Order is already closed' });
    }

    if (order.status !== 'lista_entrega' && order.status !== 'entregada') {
      return res.status(400).json({
        message:
          "Order must be in 'lista_entrega' or 'entregada' status before closing",
      });
    }

    const subtotalParts = order.partsUsed.reduce(
      (sum, p) => sum + p.quantity * p.unitPrice,
      0
    );
    const subtotalLabor = order.labor.reduce((sum, l) => sum + l.cost, 0);
    const tax = Math.round((subtotalParts + subtotalLabor) * TAX_RATE);
    const total = subtotalParts + subtotalLabor + tax;

    order.subtotalParts = subtotalParts;
    order.subtotalLabor = subtotalLabor;
    order.tax = tax;
    order.total = total;
    order.status = 'entregada';
    order.isClosed = true;
    order.closedAt = new Date();

    await order.save();

    const populated = await Order.findById(order._id)
      .populate('motorcycle', 'plate brand model')
      .populate('client', 'name email phone')
      .populate('mechanic', 'name')
      .populate('partsUsed.part', 'sku name brand');

    logger.exito('Orden cerrada: %s | Total: $%d', populated._id, total);

    eventEmitter.emit('order:closed', {
      orderId: populated._id,
      clientEmail: populated.client.email,
      orderData: populated,
    });

    res.status(200).json({
      message: 'Order closed successfully',
      order: populated,
    });
  } catch (error) {
    logger.fracaso('Error al cerrar orden: ', error);
    next(error);
  }
};

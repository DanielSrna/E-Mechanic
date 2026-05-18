import Client from '../models/client.model.js';
import Motorcycle from '../models/motorcycle.model.js';
import logger from '../utils/logger.js';

export const createClient = async (req, res, next) => {
  logger.contexto('Iniciando controlador createClient');

  try {
    const { name, phone, email, address } = req.body;

    logger.proceso('Creando nuevo cliente en la base de datos...');
    const client = new Client({
      name,
      phone,
      ...(email && { email }),
      ...(address && { address }),
    });
    await client.save();
    logger.exito('Cliente creado exitosamente: %s', client.name);

    res.status(201).json({
      message: 'Client created successfully',
      client,
    });
  } catch (error) {
    logger.fracaso('Error al crear cliente: ', error);
    next(error);
  }
};

export const getClients = async (req, res, next) => {
  logger.contexto('Iniciando controlador getClients');

  try {
    const { search } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    logger.proceso('Consultando clientes en la base de datos...');
    const clients = await Client.find(filter).sort({ createdAt: -1 }).lean();

    logger.exito('Clientes obtenidos: %d encontrados', clients.length);

    res.status(200).json({
      count: clients.length,
      clients,
    });
  } catch (error) {
    logger.fracaso('Error al obtener clientes: ', error);
    next(error);
  }
};

export const getClientById = async (req, res, next) => {
  logger.contexto('Iniciando controlador getClientById');

  try {
    const { id } = req.params;

    logger.proceso('Buscando cliente por ID...');
    const client = await Client.findById(id).lean();

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    logger.exito('Cliente encontrado: %s', client.name);

    res.status(200).json({ client });
  } catch (error) {
    logger.fracaso('Error al obtener cliente: ', error);
    next(error);
  }
};

export const updateClient = async (req, res, next) => {
  logger.contexto('Iniciando controlador updateClient');

  try {
    const { id } = req.params;
    const updateData = req.body;

    logger.proceso('Actualizando cliente...');
    const client = await Client.findByIdAndUpdate(id, updateData, {
      returnDocument: 'after',
      runValidators: true,
    });

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    logger.exito('Cliente actualizado: %s', client.name);

    res.status(200).json({
      message: 'Client updated successfully',
      client,
    });
  } catch (error) {
    logger.fracaso('Error al actualizar cliente: ', error);
    next(error);
  }
};

export const deleteClient = async (req, res, next) => {
  logger.contexto('Iniciando controlador deleteClient');

  try {
    const { id } = req.params;

    const linkedMotos = await Motorcycle.countDocuments({ client: id });
    if (linkedMotos > 0) {
      return res.status(409).json({
        message: `Cannot delete client: has ${linkedMotos} motorcycle(s) registered.`,
      });
    }

    logger.proceso('Eliminando cliente...');
    const client = await Client.findByIdAndDelete(id);

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    logger.exito('Cliente eliminado: %s', client.name);

    res.status(200).json({ message: 'Client deleted successfully' });
  } catch (error) {
    logger.fracaso('Error al eliminar cliente: ', error);
    next(error);
  }
};

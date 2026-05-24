import { randomBytes } from 'node:crypto';
import Webhook from '../models/webhook.model.js';
import logger from '../utils/logger.js';

export const getWebhooks = async (req, res, next) => {
  try {
    const webhooks = await Webhook.find().sort({ createdAt: -1 });
    res.status(200).json({ webhooks });
  } catch (error) {
    logger.fracaso('Error al obtener webhooks: ', error);
    next(error);
  }
};

export const createWebhook = async (req, res, next) => {
  try {
    const { url, description, events, isActive } = req.body;
    const secret = randomBytes(32).toString('hex');

    const webhook = await Webhook.create({
      url,
      description,
      events,
      isActive: isActive !== undefined ? isActive : true,
      secret,
    });

    logger.exito('Webhook creado: %s', url);

    res.status(201).json({
      message: 'Webhook created',
      webhook: {
        _id: webhook._id,
        url: webhook.url,
        description: webhook.description,
        events: webhook.events,
        isActive: webhook.isActive,
        secret,
        createdAt: webhook.createdAt,
      },
    });
  } catch (error) {
    logger.fracaso('Error al crear webhook: ', error);
    next(error);
  }
};

export const deleteWebhook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const webhook = await Webhook.findByIdAndDelete(id);
    if (!webhook) return res.status(404).json({ message: 'Webhook not found' });
    logger.exito('Webhook eliminado: %s', webhook.url);
    res.status(200).json({ message: 'Webhook deleted' });
  } catch (error) {
    logger.fracaso('Error al eliminar webhook: ', error);
    next(error);
  }
};

export const toggleWebhook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const webhook = await Webhook.findById(id);
    if (!webhook) return res.status(404).json({ message: 'Webhook not found' });
    webhook.isActive = !webhook.isActive;
    await webhook.save();
    logger.exito(
      'Webhook %s: %s',
      webhook.isActive ? 'activado' : 'desactivado',
      webhook.url
    );
    res.status(200).json({
      message: `Webhook ${webhook.isActive ? 'activated' : 'deactivated'}`,
      webhook,
    });
  } catch (error) {
    logger.fracaso('Error al alternar webhook: ', error);
    next(error);
  }
};

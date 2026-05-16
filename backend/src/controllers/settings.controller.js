import Settings from '../models/settings.model.js';
import logger from '../utils/logger.js';
import { deleteFile } from '../services/storage.service.js';

export const getSettings = async (req, res, next) => {
  logger.contexto('Iniciando controlador getSettings');

  try {
    const settings = await Settings.getSettings();
    logger.exito('Configuración obtenida');
    res.status(200).json({ settings });
  } catch (error) {
    logger.fracaso('Error al obtener configuración: ', error);
    next(error);
  }
};

export const updateSettings = async (req, res, next) => {
  logger.contexto('Iniciando controlador updateSettings');

  try {
    const {
      appName,
      primaryColor,
      secondaryColor,
      accentColor,
      companyName,
      companyNit,
      companyAddress,
      companyPhone,
      companyEmail,
    } = req.body;

    logger.proceso('Actualizando configuración del sistema...');
    const settings = await Settings.getSettings();

    if (appName !== undefined) settings.appName = appName;
    if (primaryColor !== undefined) settings.primaryColor = primaryColor;
    if (secondaryColor !== undefined) settings.secondaryColor = secondaryColor;
    if (accentColor !== undefined) settings.accentColor = accentColor;
    if (companyName !== undefined) settings.companyName = companyName;
    if (companyNit !== undefined) settings.companyNit = companyNit;
    if (companyAddress !== undefined) settings.companyAddress = companyAddress;
    if (companyPhone !== undefined) settings.companyPhone = companyPhone;
    if (companyEmail !== undefined) settings.companyEmail = companyEmail;

    await settings.save();
    logger.exito('Configuración actualizada');
    res.status(200).json({ message: 'Settings updated', settings });
  } catch (error) {
    logger.fracaso('Error al actualizar configuración: ', error);
    next(error);
  }
};

export const uploadLogo = async (req, res, next) => {
  logger.contexto('Iniciando controlador uploadLogo');

  try {
    if (!req.uploadedFileUrl) {
      return res.status(400).json({ message: 'No se recibió ninguna imagen' });
    }

    const settings = await Settings.getSettings();

    if (settings.logo) {
      await deleteFile(settings.logo);
    }

    settings.logo = req.uploadedFileUrl;
    await settings.save();

    logger.exito('Logo actualizado: %s', settings.logo);
    res.status(200).json({
      message: 'Logo uploaded successfully',
      logo: settings.logo,
    });
  } catch (error) {
    logger.fracaso('Error al subir logo: ', error);
    next(error);
  }
};

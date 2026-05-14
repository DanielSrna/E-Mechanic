import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import JWT from '../models/jwt.model.js';
import logger from '../utils/logger.js';
import { generateAuthTokens } from '../services/jwt.service.js';
import { env } from '../config/env.config.js';

const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

export const register = async (req, res, next) => {
  logger.contexto(
    'Iniciando controlador Register en backend/src/controllers/user.controller.js'
  );

  try {
    const { name, email, cedula, password } = req.body;

    logger.proceso('Creando el nuevo usuario en la base de datos...');
    const newUser = await User.newUser({
      name,
      email,
      cedula,
      password,
    });
    logger.exito('Usuario creado exitosamente');

    res.status(201).json({
      message: 'User created successfully',
      user: {
        email: newUser.email,
        name: newUser.name,
      },
    });
  } catch (error) {
    logger.fracaso('Ocurrió un error al crear el usuario: ', error);
    next(error);
  }
};

export const login = async (req, res, next) => {
  logger.contexto(
    'Iniciando controlador Login en backend/src/controllers/user.controller.js'
  );

  try {
    const { email, password } = req.body;

    logger.proceso('Buscando el usuario en la base de datos...');
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      logger.fracaso(
        'Intento de inicio de sesión con cuenta desactivada: %s',
        email
      );
      return res.status(401).json({
        message: 'Account is deactivated. Contact an administrator.',
      });
    }

    logger.proceso(
      'Comparando la contraseña proporcionada con la almacenada...'
    );
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    logger.proceso('Iniciando servicio de generación de tokens...');
    const { accessToken, refreshToken } = await generateAuthTokens(
      user,
      req.headers['user-agent']
    );

    logger.contexto(
      'Volviendo al controlador Login en backend/src/controllers/user.controller.js'
    );

    logger.proceso('Configurando la cookie segura para el refresh token...');

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE,
    });

    logger.exito('Inicio de sesión exitoso');

    res.status(200).json({
      message: 'Login successful',
      accessToken,
    });
  } catch (error) {
    logger.fracaso('Ocurrió un error al iniciar sesión: ', error);
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  logger.contexto('Iniciando controlador refreshToken');

  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      logger.fracaso('Refresh token no encontrado en las cookies');
      return res.status(401).json({ message: 'Refresh token required' });
    }

    logger.proceso('Verificando refresh token...');
    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);
    } catch (err) {
      logger.fracaso('Refresh token inválido o expirado: %s', err.message);
      res.clearCookie('refreshToken');
      return res
        .status(401)
        .json({ message: 'Invalid or expired refresh token' });
    }

    logger.proceso('Buscando token en la base de datos...');
    const existingToken = await JWT.findOne({
      userId: decoded.userId,
      token: token,
      type: 'refresh',
    });

    if (!existingToken) {
      logger.fracaso('Token no encontrado en BD o ya fue revocado');
      res.clearCookie('refreshToken');
      return res
        .status(401)
        .json({ message: 'Token not found or already revoked' });
    }

    logger.proceso('Eliminando token anterior...');
    await JWT.deleteOne({ _id: existingToken._id });

    logger.proceso('Buscando usuario...');
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      logger.fracaso('Usuario no encontrado o desactivado al refrescar token');
      res.clearCookie('refreshToken');
      return res.status(401).json({
        message: 'User not found or deactivated',
      });
    }

    logger.proceso('Generando nuevos tokens...');
    const tokens = await generateAuthTokens(user, req.headers['user-agent']);

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE,
    });

    logger.exito('Token refrescado exitosamente para usuario: %s', user.email);

    res.status(200).json({
      message: 'Token refreshed successfully',
      accessToken: tokens.accessToken,
    });
  } catch (error) {
    logger.fracaso('Error al refrescar token: ', error);
    res.clearCookie('refreshToken');
    next(error);
  }
};

export const logout = async (req, res, next) => {
  logger.contexto('Iniciando controlador logout');

  try {
    const token = req.cookies.refreshToken;

    if (token) {
      logger.proceso('Eliminando refresh token de la base de datos...');
      await JWT.deleteMany({ token: token, type: 'refresh' });
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    logger.exito('Sesión cerrada exitosamente');

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    logger.fracaso('Error al cerrar sesión: ', error);
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  logger.contexto('Iniciando controlador getMe');

  try {
    logger.exito('Perfil de usuario obtenido: %s', req.user.email);

    res.status(200).json({
      user: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        cedula: req.user.cedula,
        rol: req.user.rol,
        isActive: req.user.isActive,
        createdAt: req.user.createdAt,
        updatedAt: req.user.updatedAt,
      },
    });
  } catch (error) {
    logger.fracaso('Error al obtener perfil: ', error);
    next(error);
  }
};

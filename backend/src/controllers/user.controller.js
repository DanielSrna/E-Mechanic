import jwt from 'jsonwebtoken';
import { randomBytes } from 'node:crypto';
import User from '../models/user.model.js';
import JWT from '../models/jwt.model.js';
import Order from '../models/order.model.js';
import logger from '../utils/logger.js';
import { generateAuthTokens } from '../services/jwt.service.js';
import { sendVerificationEmail } from '../services/email.service.js';
import { env } from '../config/env.config.js';

const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

export const register = async (req, res, next) => {
  logger.contexto('Iniciando controlador Register');
  try {
    const { name, email, cedula, password } = req.body;
    logger.proceso('Creando el nuevo usuario en la base de datos...');
    const newUser = await User.newUser({ name, email, cedula, password });
    logger.exito('Usuario creado exitosamente');
    res.status(201).json({
      message: 'User created successfully',
      user: { email: newUser.email, name: newUser.name },
    });
  } catch (error) {
    logger.fracaso('Ocurrió un error al crear el usuario: ', error);
    next(error);
  }
};

export const login = async (req, res, next) => {
  logger.contexto('Iniciando controlador Login');
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
    logger.proceso('Configurando la cookie segura para el refresh token...');
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: COOKIE_MAX_AGE,
    });
    logger.exito('Inicio de sesión exitoso');
    res.status(200).json({ message: 'Login successful', accessToken });
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
      token,
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
      sameSite: env.NODE_ENV === 'production' ? 'strict' : 'lax',
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
      await JWT.deleteMany({ token, type: 'refresh' });
    }
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: env.NODE_ENV === 'production' ? 'strict' : 'lax',
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
        photo: req.user.photo,
        createdAt: req.user.createdAt,
        updatedAt: req.user.updatedAt,
      },
    });
  } catch (error) {
    logger.fracaso('Error al obtener perfil: ', error);
    next(error);
  }
};

export const createMechanic = async (req, res, next) => {
  logger.contexto('Iniciando controlador createMechanic');
  try {
    const { name, email, cedula, password, rol } = req.body;
    logger.proceso('Creando nuevo mecánico...');
    const user = await User.newUser({
      name,
      email,
      cedula,
      password,
      rol: rol || 'mecanico',
    });
    logger.exito('Mecánico creado: %s', user.email);
    res.status(201).json({
      message: 'User created successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        rol: user.rol,
      },
    });
  } catch (error) {
    logger.fracaso('Error al crear mecánico: ', error);
    next(error);
  }
};

export const getMechanics = async (req, res, next) => {
  logger.contexto('Iniciando controlador getMechanics');
  try {
    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();
    logger.exito('%d usuarios encontrados', users.length);
    res.status(200).json({ users });
  } catch (error) {
    logger.fracaso('Error al obtener mecánicos: ', error);
    next(error);
  }
};

export const updateMechanic = async (req, res, next) => {
  logger.contexto('Iniciando controlador updateMechanic');
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    delete updateData.password;

    if (req.body.password) {
      const user = await User.findById(id);
      if (user) {
        user.password = req.body.password;
        await user.save();
      }
    }

    const user = await User.findByIdAndUpdate(id, updateData, {
      returnDocument: 'after',
      runValidators: true,
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    logger.exito('Mecánico actualizado: %s', user.email);
    res.status(200).json({
      message: 'Updated',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        rol: user.rol,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    logger.fracaso('Error al actualizar: ', error);
    next(error);
  }
};

export const getMechanicById = async (req, res, next) => {
  logger.contexto('Iniciando controlador getMechanicById');
  try {
    const user = await User.findById(req.params.id).select('-password').lean();
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ user });
  } catch (error) {
    logger.fracaso('Error al obtener mecánico: ', error);
    next(error);
  }
};

export const fireMechanic = async (req, res, next) => {
  logger.contexto('Iniciando controlador fireMechanic');
  try {
    const { id } = req.params;
    const reassignTo = req.body?.reassignTo ?? undefined;

    const mechanic = await User.findById(id);
    if (!mechanic) return res.status(404).json({ message: 'User not found' });
    if (mechanic.rol === 'admin')
      return res.status(400).json({ message: 'Cannot fire an admin' });

    const activeOrders = await Order.find({
      mechanic: id,
      status: { $nin: ['entregada', 'cancelada'] },
    });

    if (reassignTo && activeOrders.length > 0) {
      const target = await User.findById(reassignTo);
      if (!target || target.rol !== 'mecanico' || !target.isActive) {
        return res
          .status(400)
          .json({ message: 'Reassignment target must be an active mechanic' });
      }
      await Order.updateMany(
        { mechanic: id, status: { $nin: ['entregada', 'cancelada'] } },
        { mechanic: reassignTo }
      );
      logger.exito(
        '%d órdenes reasignadas de %s a %s',
        activeOrders.length,
        mechanic.name,
        target.name
      );
    } else if (activeOrders.length > 0) {
      const leastBusy = await Order.aggregate([
        {
          $match: {
            status: { $nin: ['entregada', 'cancelada'] },
            mechanic: { $ne: mechanic._id },
          },
        },
        { $group: { _id: '$mechanic', count: { $sum: 1 } } },
        { $sort: { count: 1 } },
        { $limit: 1 },
      ]);

      if (leastBusy.length > 0) {
        await Order.updateMany(
          { mechanic: id, status: { $nin: ['entregada', 'cancelada'] } },
          { mechanic: leastBusy[0]._id }
        );
        logger.exito(
          '%d órdenes reasignadas al mecánico menos ocupado',
          activeOrders.length
        );
      } else {
        return res.status(400).json({
          message: `Cannot fire mechanic: no other active mechanics available to reassign ${activeOrders.length} active order(s).`,
        });
      }
    }

    mechanic.isActive = false;
    await mechanic.save();
    logger.exito('Mecánico despedido: %s', mechanic.name);

    res.status(200).json({
      message: 'Mechanic deactivated',
      reassignedOrders: activeOrders.length,
    });
  } catch (error) {
    logger.fracaso('Error al despedir: ', error);
    next(error);
  }
};

export const rehireMechanic = async (req, res, next) => {
  logger.contexto('Iniciando controlador rehireMechanic');
  try {
    const { id } = req.params;
    const mechanic = await User.findById(id);
    if (!mechanic) return res.status(404).json({ message: 'User not found' });
    if (mechanic.rol === 'admin')
      return res.status(400).json({ message: 'Cannot rehire an admin' });
    if (mechanic.isActive)
      return res.status(400).json({ message: 'Mechanic is already active' });

    mechanic.isActive = true;
    await mechanic.save();
    logger.exito('Mecánico recontratado: %s', mechanic.name);
    res.status(200).json({
      message: 'Mechanic reactivated',
      user: {
        _id: mechanic._id,
        name: mechanic.name,
        email: mechanic.email,
        rol: mechanic.rol,
        isActive: mechanic.isActive,
      },
    });
  } catch (error) {
    logger.fracaso('Error al recontratar: ', error);
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  logger.contexto('Iniciando controlador changePassword');
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: 'Current and new password required' });
    }
    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: 'New password must be at least 6 characters' });
    }
    const user = await User.findById(req.user._id).select('+password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    logger.exito('Contraseña cambiada para %s', req.user.email);
    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    logger.fracaso('Error al cambiar contraseña: ', error);
    next(error);
  }
};

export const changeEmail = async (req, res, next) => {
  logger.contexto('Iniciando controlador changeEmail');
  try {
    const { currentPassword, newEmail } = req.body;
    if (!currentPassword || !newEmail) {
      return res
        .status(400)
        .json({ message: 'Current password and new email are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(newEmail)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    const existing = await User.findOne({ email: newEmail.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'Email is already in use' });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    const verifyToken = randomBytes(32).toString('hex');
    await JWT.saveToken(
      req.user._id,
      verifyToken,
      'verifyEmail',
      'email-change',
      24 * 60 * 60 * 1000
    );

    user.pendingEmail = newEmail;
    await user.save();

    if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
      await sendVerificationEmail(newEmail, req.user.name, verifyToken);
    }

    logger.exito(
      'Solicitud de cambio de email: %s → %s',
      req.user.email,
      newEmail
    );
    res
      .status(200)
      .json({ message: 'Verification email sent. Check your inbox.' });
  } catch (error) {
    logger.fracaso('Error al cambiar email: ', error);
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  logger.contexto('Iniciando controlador verifyEmail');
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ message: 'Token is required' });

    const jwtRecord = await JWT.findOne({ token, type: 'verifyEmail' });
    if (!jwtRecord) {
      return res
        .status(400)
        .json({ message: 'Invalid or expired verification token' });
    }

    const user = await User.findById(jwtRecord.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.pendingEmail)
      return res.status(400).json({ message: 'No pending email change' });

    user.email = user.pendingEmail;
    user.pendingEmail = undefined;
    await user.save();

    await JWT.deleteToken(jwtRecord.userId, 'email-change', 'verifyEmail');

    logger.exito('Email verificado y actualizado: %s', user.email);
    res
      .status(200)
      .json({ message: 'Email verified and updated successfully' });
  } catch (error) {
    logger.fracaso('Error al verificar email: ', error);
    next(error);
  }
};

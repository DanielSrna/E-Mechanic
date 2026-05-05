import jwt from "jsonwebtoken";
import JWT from "../models/jwt.model.js"; 
import { env } from "../config/env.config.js";
import logger from "../utils/logger.js";

export const generateAuthTokens = async (user, userAgent) => {

    logger.contexto("Iniciando servicio generateAuthTokens en backend/src/services/jwt.service.js");

    logger.proceso("Generando accessToken...");
    const accessToken = jwt.sign(
        { userId: user._id, email: user.email, rol: user.rol },
        env.JWT_SECRET,
        { expiresIn: env.JWT_SECRET_EXPIRES_IN }
    );
    
    logger.proceso("Generando refreshToken...");
    const refreshToken = jwt.sign(
        { userId: user._id, email: user.email, rol: user.rol },
        env.JWT_REFRESH_SECRET,
        { expiresIn: env.JWT_REFRESH_SECRET_EXPIRES_IN }
    );

    logger.proceso("Calculando tiempo de vencimiento y guardando en base de datos...");
    const DIAS_EN_MILISEGUNDOS = 7 * 24 * 60 * 60 * 1000;

    logger.proceso("Guardando el refreshToken hasheado en la base de datos...");
    await JWT.saveToken(
        user._id, 
        refreshToken, 
        'refresh', 
        userAgent || 'unknown', 
        DIAS_EN_MILISEGUNDOS
    );

    return { accessToken, refreshToken };
};
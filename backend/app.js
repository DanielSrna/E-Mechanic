import express from "express";
import helmet from "helmet";
import hpp from "hpp";
import cookieParser from "cookie-parser";
import cors from "cors";
import logger from "./src/utils/logger.js";
const app = express();

import userRoutes from "./src/modules/user/user.routes.js";

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(helmet());
app.use(hpp());
app.use(cookieParser());


// Routes
app.use('/api/users', userRoutes);

// Manejador global de errores
app.use((error, req, res, next) => {
    
    // 1. EXTRAER EL STATUS: Si el error no tiene status, asumimos 500.
    const statusCode = error.status || 500;

    // 2. LOG INTERNO: Imprimimos el error. 
    // Si es un error de validación, incluimos los detalles de express-validator.
    logger.fracaso("LOG DE ERROR:", {
        message: error.message,
        status: statusCode,
        details: error.errors || 'N/A' 
    });

    // 3. CONDICIONAL DE ENTORNO
    if (process.env.NODE_ENV === 'development') {
        
        // --- RESPUESTA EN DESARROLLO ---
        return res.status(statusCode).json({
            status: statusCode,
            message: error.message,
            errors: error.errors, // Mostramos qué campos fallaron en desarrollo
            stack: error.stack
        });

    } else {
        
        // --- RESPUESTA EN PRODUCCIÓN ---
        return res.status(statusCode).json({
            status: statusCode,
            message: statusCode === 500 
                ? "Algo salió mal en nuestros servidores" 
                : error.message,
            // En producción, solo enviamos los errores de validación si existen (status 400)
            errors: statusCode === 400 ? error.errors : undefined
        });
    }
});

export default app;
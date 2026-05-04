import { validationResult } from 'express-validator';

export const validate = (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        // Creamos un error estándar de JS
        const error = new Error("Error de validación de datos");
        
        // Adjuntamos el status que tu manejador busca (400 para errores de cliente)
        error.status = 400;
        
        // Adjuntamos el array de errores detallados de express-validator
        error.errors = errors.array(); 
        
        // Lo enviamos al manejador global
        return next(error);
    }
    
    next();
};
/*
* Path: backend/src/utils/logger.js
* Description: Configuración del logger utilizando Winston con niveles personalizados y colores.
*/

import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

// ---------------------------------------------------------
// Recreando __dirname y __filename para ES Modules
// ---------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Detectar el entorno
const isProduction = process.env.NODE_ENV === 'production';

// Definición de niveles y colores nativos de Winston
const customLevels = {
  levels: {
    fracaso: 0,
    exito: 1,
    proceso: 2,
    contexto: 3
  },
  colors: {
    fracaso: 'red',
    exito: 'green',
    proceso: 'cyan', 
    contexto: 'magenta'
  }
};

// Indicarle a Winston que registre nuestros colores personalizados
winston.addColors(customLevels.colors);

const logger = winston.createLogger({
  levels: customLevels.levels,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  transports: [
    // Transporte de Consola
    new winston.transports.Console({
      // 3. Ajustamos para que en desarrollo escuche hasta el nivel 'contexto'
      level: isProduction ? 'exito' : 'contexto',
      format: winston.format.combine(
        winston.format.colorize({ all: true }), 
        winston.format.timestamp({ format: 'HH:mm:ss' }),
        winston.format.printf(({ level, message, timestamp }) => {
          return `${timestamp} [${level}]: ${message}`;
        })
      )
    }),
    // Transporte de Archivo (Se mantiene igual)
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/app.log'),
      level: 'fracaso',
      maxFiles: 50,
      maxsize: 5242880,
      tailable: true
    })
  ]
});

export default logger;


/*
* Modo de uso:
* const logger = require('./utils/logger');
*
* logger.exito('Operación exitosa');
* logger.fracaso('Ocurrió un error');
* logger.proceso('Proceso en ejecución');
*/
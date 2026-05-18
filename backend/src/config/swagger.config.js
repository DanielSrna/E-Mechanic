import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env.config.js';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'E-Mechanic API',
      version: '1.0.0',
      description:
        'API para gestión integral de talleres mecánicos de motocicletas.',
      contact: { name: 'Daniel Felipe Serna López' },
    },
    servers: [
      {
        url: env.SWAGGER_SERVER_URL || `http://localhost:${env.PORT}`,
        description: env.NODE_ENV === 'production' ? 'Producción' : 'Desarrollo',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Access token JWT obtenido al iniciar sesión',
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

export const swaggerSpec = swaggerJsdoc(options);

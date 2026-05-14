import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'E-Mechanic API',
      version: '1.0.0',
      description:
        'API para gestión integral de talleres mecánicos de motocicletas. Sistema ERP con módulos de clientes, vehículos, órdenes de trabajo, inventario y facturación.',
      contact: {
        name: 'Daniel Felipe Serna Lopez',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desarrollo',
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

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'KBO CRUD API',
      version: '1.0.0',
      description: 'API REST pour la gestion des entreprises belges (Registre KBO)',
      contact: {
        name: 'KBO CRUD Team'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Serveur de développement'
      }
    ],
    tags: [
      {
        name: 'Entreprises',
        description: 'Opérations CRUD sur les entreprises'
      },
      {
        name: 'Unités',
        description: 'Gestion des unités d\'établissement'
      }
    ]
  },
  apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;

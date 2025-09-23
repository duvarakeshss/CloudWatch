import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DotWatch API',
      version: '1.0.0',
      description: 'API documentation for DotWatch application',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
      {
        url: 'http://172.16.121.127:5000',
        description: 'Local network server',
      },
    ],
    components: {
      schemas: {
        User: {
          type: 'object',
          required: ['name', 'email', 'companyName'],
          properties: {
            id: {
              type: 'string',
              description: 'Auto-generated user ID',
            },
            name: {
              type: 'string',
              description: 'User full name',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
            },
            companyName: {
              type: 'string',
              description: 'Company name',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'User creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'User last update timestamp',
            },
          },
        },
        Admin: {
          type: 'object',
          required: ['name', 'email', 'companyName'],
          properties: {
            id: {
              type: 'string',
              description: 'Auto-generated admin ID',
            },
            name: {
              type: 'string',
              description: 'Admin full name',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Admin email address',
            },
            companyName: {
              type: 'string',
              description: 'Company name',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Admin creation timestamp',
            },
          },
        },
        Machine: {
          type: 'object',
          required: ['machineId', 'location', 'userEmail'],
          properties: {
            id: {
              type: 'string',
              description: 'Auto-generated machine ID',
            },
            machineId: {
              type: 'string',
              description: 'Unique machine identifier',
            },
            location: {
              type: 'string',
              description: 'Machine location',
            },
            userId: {
              type: 'string',
              description: 'Associated user ID',
            },
            userEmail: {
              type: 'string',
              format: 'email',
              description: 'Associated user email',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Machine creation timestamp',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message',
            },
          },
        },
      },
    },
  },
  apis: ['./routes/*.js'], // Path to the API routes
};

const specs = swaggerJSDoc(options);

export { swaggerUi, specs };
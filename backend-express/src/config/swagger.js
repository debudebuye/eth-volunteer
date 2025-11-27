const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Ethiopian Volunteer Platform API',
      version: '2.0.0',
      description: 'A production-ready RESTful API for connecting volunteers with NGOs in Ethiopia',
      contact: {
        name: 'API Support',
        email: 'support@ethvolunteer.com',
      },
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC',
      },
    },
    servers: [
      {
        url: process.env.BACKEND_BASEURL || 'http://localhost:5005',
        description: 'Development server',
      },
      {
        url: 'https://eth-volunteer-backend.vercel.app',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'User ID',
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
            location: {
              type: 'string',
              description: 'User location',
            },
            role: {
              type: 'string',
              enum: ['volunteer', 'ngo', 'admin'],
              description: 'User role',
            },
            isBlocked: {
              type: 'boolean',
              description: 'Whether user is blocked',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation date',
            },
          },
        },
        NGO: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'NGO ID',
            },
            name: {
              type: 'string',
              description: 'NGO representative name',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'NGO email address',
            },
            organization: {
              type: 'string',
              description: 'Organization name',
            },
            role: {
              type: 'string',
              enum: ['ngo'],
              description: 'User role',
            },
            status: {
              type: 'string',
              enum: ['active', 'blocked'],
              description: 'NGO status',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation date',
            },
          },
        },
        Event: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Event ID',
            },
            name: {
              type: 'string',
              description: 'Event name',
            },
            description: {
              type: 'string',
              description: 'Event description',
            },
            date: {
              type: 'string',
              format: 'date-time',
              description: 'Event date',
            },
            location: {
              type: 'string',
              description: 'Event location',
            },
            image: {
              type: 'string',
              description: 'Event image URL',
            },
            status: {
              type: 'string',
              enum: ['pending', 'approved', 'rejected'],
              description: 'Event status',
            },
            likes: {
              type: 'number',
              description: 'Number of likes',
            },
            createdBy: {
              type: 'string',
              description: 'NGO ID who created the event',
            },
            creatorEmail: {
              type: 'string',
              description: 'Creator email',
            },
            creatorName: {
              type: 'string',
              description: 'Creator name',
            },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'Operation successful',
            },
            data: {
              type: 'object',
              description: 'Response data',
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'Error message',
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string',
                  },
                  message: {
                    type: 'string',
                  },
                },
              },
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication endpoints',
      },
      {
        name: 'Admin',
        description: 'Admin management endpoints',
      },
      {
        name: 'Users',
        description: 'User management endpoints',
      },
      {
        name: 'Events',
        description: 'Event management endpoints',
      },
      {
        name: 'NGOs',
        description: 'NGO management endpoints',
      },
      {
        name: 'Health',
        description: 'Health check endpoints',
      },
    ],
  },
  apis: ['./src/routes/*.js', './src/app.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;

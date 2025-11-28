import fp from 'fastify-plugin';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

async function swaggerPlugin(fastify, opts) {
  await fastify.register(swagger, {
    openapi: {
      info: {
        title: 'Ethiopian Volunteer Platform API - Fastify',
        description: 'High-performance RESTful API built with Fastify',
        version: '1.0.0',
      },
      servers: [
        {
          url: 'http://localhost:5002',
          description: 'Development server',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      tags: [
        { name: 'Health', description: 'Health check endpoints' },
        { name: 'Auth', description: 'Authentication endpoints' },
        { name: 'Admin', description: 'Admin endpoints' },
        { name: 'Users', description: 'User management' },
        { name: 'Events', description: 'Event management' },
      ],
    },
  });

  await fastify.register(swaggerUi, {
    routePrefix: '/api/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
    staticCSP: true,
  });
}

export default fp(swaggerPlugin, {
  name: 'swagger-plugin',
});

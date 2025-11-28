import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { config } from './config/env.js';
import { connectDatabase, closeDatabase } from './config/database.js';
import authPlugin from './plugins/auth.js';
import swaggerPlugin from './plugins/swagger.js';
import authRoutes from './routes/auth.js';
import eventRoutes from './routes/events.js';
import userRoutes from './routes/users.js';

// Create Fastify instance
const fastify = Fastify({
  logger: {
    level: config.logLevel,
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
});

// Register plugins
await fastify.register(helmet, {
  contentSecurityPolicy: false,
});

await fastify.register(cors, {
  origin: config.frontendUrl,
  credentials: true,
});

await fastify.register(rateLimit, {
  max: config.rateLimitMax,
  timeWindow: config.rateLimitTimeWindow,
});

await fastify.register(authPlugin);
await fastify.register(swaggerPlugin);

// Health check
fastify.get('/health', {
  schema: {
    tags: ['Health'],
    description: 'Health check endpoint',
  },
}, async () => {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: config.env,
    framework: 'Fastify',
  };
});

// Root endpoint
fastify.get('/', {
  schema: {
    tags: ['Health'],
    description: 'API root endpoint',
  },
}, async () => {
  return {
    message: 'Ethiopian Volunteer Platform API - Fastify',
    version: '1.0.0',
    status: 'running',
    documentation: '/api/docs',
    framework: 'Fastify',
  };
});

// Register routes with /api/v1 prefix
await fastify.register(async (instance) => {
  await instance.register(authRoutes);
  await instance.register(eventRoutes);
  await instance.register(userRoutes);
}, { prefix: '/api/v1' });

// Error handler
fastify.setErrorHandler((error, request, reply) => {
  fastify.log.error(error);

  // Validation errors
  if (error.validation) {
    return reply.code(400).send({
      error: 'Validation Error',
      message: error.message,
      details: error.validation,
    });
  }

  // JWT errors
  if (error.statusCode === 401) {
    return reply.code(401).send({
      error: 'Unauthorized',
      message: error.message,
    });
  }

  // Default error
  reply.code(error.statusCode || 500).send({
    error: error.name || 'Internal Server Error',
    message: error.message || 'Something went wrong',
  });
});

// Not found handler
fastify.setNotFoundHandler((request, reply) => {
  reply.code(404).send({
    error: 'Not Found',
    message: `Route ${request.method} ${request.url} not found`,
  });
});

// Start server
async function start() {
  try {
    // Connect to database
    await connectDatabase(fastify);

    // Start listening
    await fastify.listen({
      port: config.port,
      host: config.host,
    });

    fastify.log.info(`🚀 Server running on http://${config.host}:${config.port}`);
    fastify.log.info(`📚 API Documentation: http://localhost:${config.port}/api/docs`);
    fastify.log.info(`🌍 Environment: ${config.env}`);
    fastify.log.info(`⚡ Framework: Fastify`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

// Graceful shutdown
const signals = ['SIGINT', 'SIGTERM'];
signals.forEach((signal) => {
  process.on(signal, async () => {
    fastify.log.info(`${signal} received, closing server...`);
    await fastify.close();
    await closeDatabase();
    process.exit(0);
  });
});

start();

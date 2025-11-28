import fp from 'fastify-plugin';
import jwt from '@fastify/jwt';
import { config } from '../config/env.js';

async function authPlugin(fastify, opts) {
  // Register JWT
  await fastify.register(jwt, {
    secret: config.jwtSecret,
    sign: {
      expiresIn: config.jwtExpiresIn,
    },
  });

  // Decorate fastify with authenticate method
  fastify.decorate('authenticate', async function(request, reply) {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.code(401).send({ error: 'Unauthorized', message: 'Invalid or expired token' });
    }
  });

  // Decorate with role verification
  fastify.decorate('verifyRole', (allowedRoles) => {
    return async function(request, reply) {
      try {
        await request.jwtVerify();
        
        if (!allowedRoles.includes(request.user.role)) {
          reply.code(403).send({ 
            error: 'Forbidden', 
            message: `Access denied. Required role: ${allowedRoles.join(' or ')}` 
          });
        }
      } catch (err) {
        reply.code(401).send({ error: 'Unauthorized', message: 'Invalid or expired token' });
      }
    };
  });
}

export default fp(authPlugin, {
  name: 'auth-plugin',
});

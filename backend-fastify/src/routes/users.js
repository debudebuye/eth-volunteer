import { User } from '../models/User.js';

export default async function userRoutes(fastify) {
  // Get all users
  fastify.get('/users', {
    schema: {
      tags: ['Users'],
      description: 'Get all users',
    },
  }, async (request, reply) => {
    const users = await User.find().select('-password');

    reply.send({
      success: true,
      data: users,
    });
  });

  // Get user profile
  fastify.get('/profile/:email', {
    schema: {
      tags: ['Users'],
      description: 'Get user profile by email',
    },
  }, async (request, reply) => {
    const { email } = request.params;

    const user = await User.findOne({ email }).select('-password');
    if (!user) {
      return reply.code(404).send({ error: 'User not found' });
    }

    reply.send({
      success: true,
      data: user,
    });
  });

  // Update profile
  fastify.put('/update-profile', {
    schema: {
      tags: ['Users'],
      description: 'Update user profile',
      security: [{ bearerAuth: [] }],
    },
    preHandler: fastify.authenticate,
  }, async (request, reply) => {
    const updates = request.body;
    const userId = request.user.id;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return reply.code(404).send({ error: 'User not found' });
    }

    reply.send({
      success: true,
      message: 'Profile updated successfully',
      data: user,
    });
  });

  // Block/Unblock user (Admin only)
  fastify.patch('/users/:id/block', {
    schema: {
      tags: ['Users'],
      description: 'Block or unblock a user (Admin only)',
      security: [{ bearerAuth: [] }],
    },
    preHandler: fastify.verifyRole(['admin']),
  }, async (request, reply) => {
    const { id } = request.params;
    const { isBlocked } = request.body;

    const user = await User.findByIdAndUpdate(
      id,
      { isBlocked },
      { new: true }
    ).select('-password');

    if (!user) {
      return reply.code(404).send({ error: 'User not found' });
    }

    reply.send({
      success: true,
      message: `User ${isBlocked ? 'blocked' : 'unblocked'} successfully`,
      data: user,
    });
  });

  // Delete user (Admin only)
  fastify.delete('/users/:id', {
    schema: {
      tags: ['Users'],
      description: 'Delete a user (Admin only)',
      security: [{ bearerAuth: [] }],
    },
    preHandler: fastify.verifyRole(['admin']),
  }, async (request, reply) => {
    const { id } = request.params;

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return reply.code(404).send({ error: 'User not found' });
    }

    reply.send({
      success: true,
      message: 'User deleted successfully',
    });
  });
}

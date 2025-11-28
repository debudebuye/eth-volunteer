import { Event } from '../models/Event.js';

export default async function eventRoutes(fastify) {
  // Get approved events
  fastify.get('/events/approved', {
    schema: {
      tags: ['Events'],
      description: 'Get all approved events',
    },
  }, async (request, reply) => {
    const events = await Event.find({ status: 'approved' })
      .populate('createdBy', 'name organization')
      .sort({ date: 1 });

    reply.send({
      success: true,
      data: events,
    });
  });

  // Get events by location
  fastify.get('/events/by-location', {
    schema: {
      tags: ['Events'],
      description: 'Get events by location',
      querystring: {
        type: 'object',
        properties: {
          location: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    const { location } = request.query;

    const events = await Event.find({
      status: 'approved',
      location: new RegExp(location, 'i'),
    }).sort({ date: 1 });

    reply.send({
      success: true,
      data: events,
    });
  });

  // Get pending events (Admin only)
  fastify.get('/events/pending', {
    schema: {
      tags: ['Events'],
      description: 'Get pending events (Admin only)',
      security: [{ bearerAuth: [] }],
    },
    preHandler: fastify.verifyRole(['admin']),
  }, async (request, reply) => {
    const events = await Event.find({ status: 'pending' })
      .populate('createdBy', 'name organization')
      .sort({ createdAt: -1 });

    reply.send({
      success: true,
      data: events,
    });
  });

  // Create event (NGO only)
  fastify.post('/events/create', {
    schema: {
      tags: ['Events'],
      description: 'Create a new event (NGO only)',
      security: [{ bearerAuth: [] }],
    },
    preHandler: fastify.verifyRole(['ngo']),
  }, async (request, reply) => {
    const { name, description, date, location } = request.body;

    const event = await Event.create({
      name,
      description,
      date,
      location,
      createdBy: request.user.id,
      creatorEmail: request.user.email,
      status: 'pending',
    });

    reply.code(201).send({
      success: true,
      message: 'Event created successfully',
      data: event,
    });
  });

  // Approve event (Admin only)
  fastify.put('/events/approve/:id', {
    schema: {
      tags: ['Events'],
      description: 'Approve an event (Admin only)',
      security: [{ bearerAuth: [] }],
    },
    preHandler: fastify.verifyRole(['admin']),
  }, async (request, reply) => {
    const { id } = request.params;

    const event = await Event.findByIdAndUpdate(
      id,
      { status: 'approved' },
      { new: true }
    );

    if (!event) {
      return reply.code(404).send({ error: 'Event not found' });
    }

    reply.send({
      success: true,
      message: 'Event approved successfully',
      data: event,
    });
  });

  // Reject event (Admin only)
  fastify.put('/events/reject/:id', {
    schema: {
      tags: ['Events'],
      description: 'Reject an event (Admin only)',
      security: [{ bearerAuth: [] }],
    },
    preHandler: fastify.verifyRole(['admin']),
  }, async (request, reply) => {
    const { id } = request.params;

    const event = await Event.findByIdAndUpdate(
      id,
      { status: 'rejected' },
      { new: true }
    );

    if (!event) {
      return reply.code(404).send({ error: 'Event not found' });
    }

    reply.send({
      success: true,
      message: 'Event rejected successfully',
      data: event,
    });
  });

  // Like event
  fastify.post('/events/likes', {
    schema: {
      tags: ['Events'],
      description: 'Like an event',
    },
  }, async (request, reply) => {
    const { eventId, userId } = request.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return reply.code(404).send({ error: 'Event not found' });
    }

    if (event.likedBy.includes(userId)) {
      return reply.code(400).send({ error: 'Already liked' });
    }

    event.likes += 1;
    event.likedBy.push(userId);
    await event.save();

    reply.send({
      success: true,
      message: 'Event liked successfully',
      data: { likes: event.likes },
    });
  });

  // Delete event
  fastify.delete('/events/delete/:id', {
    schema: {
      tags: ['Events'],
      description: 'Delete an event',
      security: [{ bearerAuth: [] }],
    },
    preHandler: fastify.authenticate,
  }, async (request, reply) => {
    const { id } = request.params;

    const event = await Event.findByIdAndDelete(id);
    if (!event) {
      return reply.code(404).send({ error: 'Event not found' });
    }

    reply.send({
      success: true,
      message: 'Event deleted successfully',
    });
  });
}

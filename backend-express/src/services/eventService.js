const eventRepository = require('../repositories/eventRepository');
const { NotFoundError, BadRequestError, ForbiddenError } = require('../utils/errors');
const { EVENT_STATUS } = require('../utils/constants');
const logger = require('../utils/logger');
const emailService = require('./emailService');

/**
 * Event Service - Handles all event-related business logic
 */
class EventService {
  /**
   * Create event
   */
  async createEvent(eventData, ngoId) {
    const { name, description, date, location, image, creatorEmail, creatorName } = eventData;

    // Validate date is in future
    const eventDate = new Date(date);
    if (eventDate < new Date()) {
      throw new BadRequestError('Event date must be in the future');
    }

    const event = await eventRepository.create({
      name,
      description,
      date,
      location,
      image,
      status: EVENT_STATUS.PENDING,
      createdBy: ngoId,
      creatorEmail,
      creatorName,
    });

    logger.info(`Event created by NGO ${ngoId}: ${event._id}`);

    return {
      message: 'Event created successfully! Pending admin approval.',
      event,
    };
  }

  /**
   * Get all approved events
   */
  async getApprovedEvents() {
    return await eventRepository.findApproved();
  }

  /**
   * Get all pending events
   */
  async getPendingEvents() {
    return await eventRepository.findPending();
  }

  /**
   * Get all rejected events
   */
  async getRejectedEvents() {
    return await eventRepository.findRejected();
  }

  /**
   * Get event by ID
   */
  async getEventById(eventId) {
    const event = await eventRepository.findById(eventId);
    if (!event) {
      throw new NotFoundError('Event not found');
    }
    return event;
  }

  /**
   * Get events by NGO
   */
  async getEventsByNGO(ngoId) {
    return await eventRepository.findByCreator(ngoId);
  }

  /**
   * Get events by NGO with details (for tracking)
   */
  async getEventsByNGOWithDetails(ngoId) {
    return await eventRepository.findByCreatorWithDetails(ngoId);
  }

  /**
   * Get events by location with pagination
   */
  async getEventsByLocation(location, options = {}) {
    if (!location) {
      throw new BadRequestError('Location parameter is required');
    }
    return await eventRepository.findByLocation(location, options);
  }

  /**
   * Get events followed by user
   */
  async getFollowedEvents(userId) {
    return await eventRepository.findFollowedByUser(userId);
  }

  /**
   * Approve event
   */
  async approveEvent(eventId) {
    const event = await eventRepository.findById(eventId);
    if (!event) {
      throw new NotFoundError('Event not found');
    }

    const updatedEvent = await eventRepository.updateStatus(eventId, EVENT_STATUS.APPROVED);

    // Send email notification
    try {
      await emailService.sendEventApprovalEmail(event);
    } catch (error) {
      logger.error('Failed to send approval email:', error);
      // Don't fail the approval if email fails
    }

    logger.info(`Event approved: ${eventId}`);

    return {
      message: 'Event approved successfully',
      event: updatedEvent,
    };
  }

  /**
   * Reject event
   */
  async rejectEvent(eventId) {
    const event = await eventRepository.findById(eventId);
    if (!event) {
      throw new NotFoundError('Event not found');
    }

    const updatedEvent = await eventRepository.updateStatus(eventId, EVENT_STATUS.REJECTED);
    logger.info(`Event rejected: ${eventId}`);

    return {
      message: 'Event rejected successfully',
      event: updatedEvent,
    };
  }

  /**
   * Move event back to pending (from approved or rejected)
   */
  async moveToPending(eventId) {
    const event = await eventRepository.findById(eventId);
    if (!event) {
      throw new NotFoundError('Event not found');
    }

    const updatedEvent = await eventRepository.updateStatus(eventId, EVENT_STATUS.PENDING);
    logger.info(`Event moved to pending: ${eventId}`);

    return updatedEvent;
  }

  /**
   * Update event
   */
  async updateEvent(eventId, updateData, ngoId) {
    const event = await eventRepository.findById(eventId);
    if (!event) {
      throw new NotFoundError('Event not found');
    }

    // Check if NGO owns the event
    if (event.createdBy.toString() !== ngoId.toString()) {
      throw new ForbiddenError('You are not authorized to update this event');
    }

    const { name, description, date, location } = updateData;

    // Validate date if provided
    if (date) {
      const eventDate = new Date(date);
      if (eventDate < new Date()) {
        throw new BadRequestError('Event date must be in the future');
      }
    }

    const updatedEvent = await eventRepository.update(eventId, {
      name,
      description,
      date,
      location,
    });

    logger.info(`Event updated: ${eventId}`);

    return {
      message: 'Event updated successfully',
      event: updatedEvent,
    };
  }

  /**
   * Delete event
   */
  async deleteEvent(eventId, ngoId) {
    const event = await eventRepository.findById(eventId);
    if (!event) {
      throw new NotFoundError('Event not found');
    }

    // Check if NGO owns the event
    if (event.createdBy.toString() !== ngoId.toString()) {
      throw new ForbiddenError('You are not authorized to delete this event');
    }

    await eventRepository.delete(eventId);
    logger.info(`Event deleted: ${eventId}`);

    return { message: 'Event deleted successfully' };
  }

  /**
   * Like event
   */
  async likeEvent(eventId, userId) {
    const event = await eventRepository.findById(eventId);
    if (!event) {
      throw new NotFoundError('Event not found');
    }

    // Check if already liked
    if (event.likedBy && event.likedBy.includes(userId)) {
      throw new BadRequestError('User has already liked this event');
    }

    const updatedEvent = await eventRepository.addLike(eventId, userId);
    logger.info(`Event ${eventId} liked by user ${userId}`);

    return {
      message: 'Event liked successfully',
      event: updatedEvent,
    };
  }

  /**
   * Unlike event
   */
  async unlikeEvent(eventId, userId) {
    const event = await eventRepository.findById(eventId);
    if (!event) {
      throw new NotFoundError('Event not found');
    }

    // Check if not liked
    if (!event.likedBy || !event.likedBy.includes(userId)) {
      throw new BadRequestError('User has not liked this event');
    }

    const updatedEvent = await eventRepository.removeLike(eventId, userId);
    logger.info(`Event ${eventId} unliked by user ${userId}`);

    return {
      message: 'Event unliked successfully',
      event: updatedEvent,
    };
  }

  /**
   * Follow event
   */
  async followEvent(eventId, userId) {
    const event = await eventRepository.findById(eventId);
    if (!event) {
      throw new NotFoundError('Event not found');
    }

    const updatedEvent = await eventRepository.addFollower(eventId, userId);
    logger.info(`Event ${eventId} followed by user ${userId}`);

    return {
      message: 'Followed successfully',
      event: updatedEvent,
    };
  }

  /**
   * Add comment to event
   */
  async addComment(eventId, userId, text) {
    const event = await eventRepository.findById(eventId);
    if (!event) {
      throw new NotFoundError('Event not found');
    }

    await eventRepository.addComment(eventId, {
      userId,
      text,
    });

    logger.info(`Comment added to event ${eventId} by user ${userId}`);

    return {
      message: 'Comment added successfully',
      comment: { userId, text },
    };
  }

  /**
   * Get comments for event
   */
  async getComments(eventId) {
    const event = await eventRepository.findByIdWithComments(eventId);
    if (!event) {
      throw new NotFoundError('Event not found');
    }

    return event.comments || [];
  }

  /**
   * Add reply to comment
   */
  async addReply(eventId, commentId, ngoId, text) {
    const event = await eventRepository.findById(eventId);
    if (!event) {
      throw new NotFoundError('Event not found');
    }

    const updatedEvent = await eventRepository.addReply(eventId, commentId, {
      userId: ngoId,
      text,
    });

    if (!updatedEvent) {
      throw new NotFoundError('Comment not found');
    }

    logger.info(`Reply added to comment ${commentId} on event ${eventId}`);

    return {
      message: 'Reply added successfully',
      event: updatedEvent,
    };
  }
}

module.exports = new EventService();

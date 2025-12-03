const eventRepository = require('../repositories/eventRepository');
const { NotFoundError, BadRequestError, ForbiddenError } = require('../utils/errors');
const { EVENT_STATUS } = require('../utils/constants');
const logger = require('../utils/logger');
const emailService = require('./emailService');
const { cache, cacheKeys, cacheTTL } = require('../utils/cache');

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

    // Invalidate location-based cache
    cache.deletePattern(`events:${location}:`);

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
   * Get event by ID (with caching)
   */
  async getEventById(eventId) {
    // Try cache first
    const cacheKey = cacheKeys.event(eventId);
    const cached = cache.get(cacheKey);
    if (cached) {
      logger.debug(`Cache hit: ${cacheKey}`);
      return cached;
    }
    
    // Cache miss - query database
    const event = await eventRepository.findByIdWithComments(eventId);
    if (!event) {
      throw new NotFoundError('Event not found');
    }
    
    // Store in cache
    cache.set(cacheKey, event, cacheTTL.event);
    logger.debug(`Cache set: ${cacheKey}`);
    
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
   * Get events by location with pagination (with caching)
   */
  async getEventsByLocation(location, options = {}) {
    if (!location) {
      throw new BadRequestError('Location parameter is required');
    }
    
    const { page = 1, status = 'approved', userId } = options;
    
    // Try cache first (only for non-user-specific queries)
    if (!userId) {
      const cacheKey = cacheKeys.eventList(location, page, status);
      const cached = cache.get(cacheKey);
      if (cached) {
        logger.debug(`Cache hit: ${cacheKey}`);
        return cached;
      }
    }
    
    const result = await eventRepository.findByLocation(location, options);
    
    // If userId provided, batch check participation
    if (userId && result.events.length > 0) {
      const eventIds = result.events.map(e => e._id);
      const joinedIds = await eventRepository.batchCheckParticipation(eventIds, userId);
      
      // Add isJoined flag to each event
      result.events.forEach(event => {
        event.isJoined = joinedIds.has(event._id.toString());
      });
    } else {
      // Cache result for non-user-specific queries
      const cacheKey = cacheKeys.eventList(location, page, status);
      cache.set(cacheKey, result, cacheTTL.eventList);
      logger.debug(`Cache set: ${cacheKey}`);
    }
    
    return result;
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

    // Send email notification to NGO
    try {
      const ngoEmail = event.creatorEmail || event.createdBy?.email;
      if (ngoEmail) {
        await emailService.sendEventApprovalEmail(event, ngoEmail);
        logger.info(`Approval email sent to: ${ngoEmail}`);
      } else {
        logger.warn(`No email found for event ${eventId}`);
      }
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

    // Send rejection email notification to NGO
    try {
      const ngoEmail = event.creatorEmail || event.createdBy?.email;
      if (ngoEmail) {
        await emailService.sendEventRejectionEmail(event, ngoEmail);
        logger.info(`Rejection email sent to: ${ngoEmail}`);
      } else {
        logger.warn(`No email found for event ${eventId}`);
      }
    } catch (error) {
      logger.error('Failed to send rejection email:', error);
      // Don't fail the rejection if email fails
    }

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

    // Invalidate cache
    cache.delete(cacheKeys.event(eventId));
    cache.deletePattern(`events:${event.location}:`);
    if (location && location !== event.location) {
      cache.deletePattern(`events:${location}:`);
    }

    return {
      message: 'Event updated successfully',
      event: updatedEvent,
    };
  }

  /**
   * Delete event (NGO - must own the event)
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
    logger.info(`Event deleted by NGO: ${eventId}`);

    return { message: 'Event deleted successfully' };
  }

  /**
   * Delete event (Admin - can delete any event)
   */
  async deleteEventByAdmin(eventId) {
    const event = await eventRepository.findById(eventId);
    if (!event) {
      throw new NotFoundError('Event not found');
    }

    await eventRepository.delete(eventId);
    logger.info(`Event deleted by admin: ${eventId}`);

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

    // Invalidate event cache
    cache.delete(cacheKeys.event(eventId));

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
      reply: updatedEvent.comments.id(commentId).replies[updatedEvent.comments.id(commentId).replies.length - 1],
    };
  }

  /**
   * Like comment
   */
  async likeComment(eventId, commentId, userId) {
    const event = await eventRepository.findById(eventId);
    if (!event) {
      throw new NotFoundError('Event not found');
    }

    const comment = event.comments.id(commentId);
    if (!comment) {
      throw new NotFoundError('Comment not found');
    }

    // Check if already liked
    if (comment.likedBy && comment.likedBy.includes(userId)) {
      throw new BadRequestError('User has already liked this comment');
    }

    comment.likes = (comment.likes || 0) + 1;
    comment.likedBy = comment.likedBy || [];
    comment.likedBy.push(userId);
    
    await event.save();
    logger.info(`Comment ${commentId} liked by user ${userId}`);

    return {
      message: 'Comment liked successfully',
      comment,
    };
  }

  /**
   * Unlike comment
   */
  async unlikeComment(eventId, commentId, userId) {
    const event = await eventRepository.findById(eventId);
    if (!event) {
      throw new NotFoundError('Event not found');
    }

    const comment = event.comments.id(commentId);
    if (!comment) {
      throw new NotFoundError('Comment not found');
    }

    // Check if not liked
    if (!comment.likedBy || !comment.likedBy.includes(userId)) {
      throw new BadRequestError('User has not liked this comment');
    }

    comment.likes = Math.max((comment.likes || 1) - 1, 0);
    comment.likedBy = comment.likedBy.filter(id => id.toString() !== userId.toString());
    
    await event.save();
    logger.info(`Comment ${commentId} unliked by user ${userId}`);

    return {
      message: 'Comment unliked successfully',
      comment,
    };
  }

  /**
   * Update comment
   */
  async updateComment(eventId, commentId, userId, text) {
    const event = await eventRepository.findById(eventId);
    if (!event) {
      throw new NotFoundError('Event not found');
    }

    const comment = event.comments.id(commentId);
    if (!comment) {
      throw new NotFoundError('Comment not found');
    }

    // Check if user is the comment owner
    if (comment.userId.toString() !== userId.toString()) {
      throw new BadRequestError('You can only edit your own comments');
    }

    const updatedEvent = await eventRepository.updateComment(eventId, commentId, text);
    if (!updatedEvent) {
      throw new NotFoundError('Failed to update comment');
    }

    logger.info(`Comment ${commentId} updated by user ${userId}`);

    return {
      message: 'Comment updated successfully',
      comment: updatedEvent.comments.id(commentId),
    };
  }

  /**
   * Delete comment
   */
  async deleteComment(eventId, commentId, userId) {
    const event = await eventRepository.findById(eventId);
    if (!event) {
      throw new NotFoundError('Event not found');
    }

    const comment = event.comments.id(commentId);
    if (!comment) {
      throw new NotFoundError('Comment not found');
    }

    // Check if user is the comment owner
    if (comment.userId.toString() !== userId.toString()) {
      throw new BadRequestError('You can only delete your own comments');
    }

    const updatedEvent = await eventRepository.deleteComment(eventId, commentId);
    if (!updatedEvent) {
      throw new NotFoundError('Failed to delete comment');
    }

    logger.info(`Comment ${commentId} deleted by user ${userId}`);

    return {
      message: 'Comment deleted successfully',
    };
  }
}

module.exports = new EventService();

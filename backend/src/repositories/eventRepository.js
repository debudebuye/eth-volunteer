const Event = require('../../models/Event');
const { EVENT_STATUS } = require('../utils/constants');

/**
 * Event Repository - Handles all database operations for events
 */
class EventRepository {
  /**
   * Create new event
   */
  async create(eventData) {
    const event = new Event(eventData);
    return await event.save();
  }

  /**
   * Find event by ID
   */
  async findById(id) {
    return await Event.findById(id);
  }

  /**
   * Find all events with optional filters
   */
  async findAll(filter = {}) {
    return await Event.find(filter);
  }

  /**
   * Find events by status
   */
  async findByStatus(status) {
    return await Event.find({ status });
  }

  /**
   * Find approved events
   */
  async findApproved() {
    return await Event.find({ status: EVENT_STATUS.APPROVED });
  }

  /**
   * Find pending events
   */
  async findPending() {
    return await Event.find({ status: EVENT_STATUS.PENDING });
  }

  /**
   * Find rejected events
   */
  async findRejected() {
    return await Event.find({ status: EVENT_STATUS.REJECTED });
  }

  /**
   * Find events by creator (NGO)
   */
  async findByCreator(creatorId) {
    return await Event.find({ createdBy: creatorId });
  }

  /**
   * Find events by creator with populated data
   */
  async findByCreatorWithDetails(creatorId) {
    return await Event.find({ createdBy: creatorId })
      .populate('likedBy', 'name email')
      .populate('followers', 'name email')
      .populate('comments.userId', 'name email');
  }

  /**
   * Find events by location
   */
  async findByLocation(location) {
    return await Event.find({ 
      location: new RegExp(location, 'i') 
    });
  }

  /**
   * Find events followed by user
   */
  async findFollowedByUser(userId) {
    return await Event.find({ 
      followers: { $in: [userId] } 
    });
  }

  /**
   * Update event
   */
  async update(id, updateData) {
    return await Event.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
  }

  /**
   * Update event status
   */
  async updateStatus(id, status) {
    return await Event.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
  }

  /**
   * Delete event
   */
  async delete(id) {
    return await Event.findByIdAndDelete(id);
  }

  /**
   * Add like to event
   */
  async addLike(eventId, userId) {
    return await Event.findByIdAndUpdate(
      eventId,
      { 
        $inc: { likes: 1 },
        $addToSet: { likedBy: userId }
      },
      { new: true }
    );
  }

  /**
   * Remove like from event
   */
  async removeLike(eventId, userId) {
    return await Event.findByIdAndUpdate(
      eventId,
      { 
        $inc: { likes: -1 },
        $pull: { likedBy: userId }
      },
      { new: true }
    );
  }

  /**
   * Add follower to event
   */
  async addFollower(eventId, userId) {
    return await Event.findByIdAndUpdate(
      eventId,
      { $addToSet: { followers: userId } },
      { new: true }
    );
  }

  /**
   * Add comment to event
   */
  async addComment(eventId, commentData) {
    return await Event.findByIdAndUpdate(
      eventId,
      { $push: { comments: commentData } },
      { new: true }
    );
  }

  /**
   * Add reply to comment
   */
  async addReply(eventId, commentId, replyData) {
    const event = await Event.findById(eventId);
    if (!event) return null;

    const comment = event.comments.id(commentId);
    if (!comment) return null;

    comment.replies.push(replyData);
    return await event.save();
  }

  /**
   * Get event with comments populated
   */
  async findByIdWithComments(eventId) {
    return await Event.findById(eventId)
      .populate('comments.userId', 'name profileImage');
  }
}

module.exports = new EventRepository();

const User = require('../../models/User');
const Event = require('../../models/Event');

/**
 * User Repository - Handles all database operations for users
 */
class UserRepository {
  /**
   * Find user by email
   */
  async findByEmail(email) {
    return await User.findOne({ email: email.toLowerCase() });
  }

  /**
   * Find user by ID
   */
  async findById(id) {
    return await User.findById(id).select('-password');
  }

  /**
   * Find user by ID (optimized - without arrays)
   */
  async findByIdLean(id) {
    return await User.findById(id)
      .select('-password -joinedEvents')
      .lean();
  }

  /**
   * Create new user
   */
  async create(userData) {
    const user = new User(userData);
    return await user.save();
  }

  /**
   * Find all users
   */
  async findAll(filter = {}) {
    return await User.find(filter)
      .select('-password -joinedEvents')
      .lean();
  }

  /**
   * Update user
   */
  async update(id, updateData) {
    return await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
  }

  /**
   * Delete user
   */
  async delete(id) {
    return await User.findByIdAndDelete(id);
  }

  /**
   * Block/Unblock user
   */
  async toggleBlock(id, isBlocked) {
    return await User.findByIdAndUpdate(
      id,
      { isBlocked },
      { new: true }
    ).select('-password');
  }

  /**
   * Add event to user's joined events
   */
  async addJoinedEvent(userId, eventId) {
    // Update both user's joinedEvents and event's participants with counts
    await Event.findByIdAndUpdate(
      eventId,
      { 
        $addToSet: { participants: userId },
        $inc: { participantCount: 1 }
      }
    );
    
    return await User.findByIdAndUpdate(
      userId,
      { 
        $addToSet: { joinedEvents: eventId },
        $inc: { joinedEventsCount: 1 }
      },
      { new: true }
    ).select('-password');
  }

  /**
   * Remove event from user's joined events
   */
  async removeJoinedEvent(userId, eventId) {
    // Update both user's joinedEvents and event's participants with counts
    await Event.findByIdAndUpdate(
      eventId,
      { 
        $pull: { participants: userId },
        $inc: { participantCount: -1 }
      }
    );
    
    return await User.findByIdAndUpdate(
      userId,
      { 
        $pull: { joinedEvents: eventId },
        $inc: { joinedEventsCount: -1 }
      },
      { new: true }
    ).select('-password');
  }

  /**
   * Get user with joined events populated
   */
  async findByIdWithEvents(userId) {
    return await User.findById(userId)
      .populate('joinedEvents')
      .select('-password');
  }
}

module.exports = new UserRepository();

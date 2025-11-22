const User = require('../../models/User');

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
    return await User.find(filter).select('-password');
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
    return await User.findByIdAndUpdate(
      userId,
      { $addToSet: { joinedEvents: eventId } },
      { new: true }
    ).select('-password');
  }

  /**
   * Remove event from user's joined events
   */
  async removeJoinedEvent(userId, eventId) {
    return await User.findByIdAndUpdate(
      userId,
      { $pull: { joinedEvents: eventId } },
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

const userRepository = require('../repositories/userRepository');
const { NotFoundError, BadRequestError } = require('../utils/errors');
const logger = require('../utils/logger');

/**
 * User Service - Handles all user-related business logic
 */
class UserService {
  /**
   * Get all users
   */
  async getAllUsers() {
    return await userRepository.findAll();
  }

  /**
   * Get user by ID
   */
  async getUserById(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  /**
   * Update user profile
   */
  async updateProfile(email, updateData) {
    const { name, location } = updateData;

    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const updatedUser = await userRepository.update(user._id, {
      name,
      location,
    });

    logger.info(`User profile updated: ${email}`);

    return updatedUser;
  }

  /**
   * Delete user
   */
  async deleteUser(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    await userRepository.delete(userId);
    logger.info(`User deleted: ${userId}`);

    return { message: 'User deleted successfully' };
  }

  /**
   * Block/Unblock user
   */
  async toggleBlockUser(userId, isBlocked) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const updatedUser = await userRepository.toggleBlock(userId, isBlocked);
    logger.info(`User ${isBlocked ? 'blocked' : 'unblocked'}: ${userId}`);

    return {
      message: `User ${isBlocked ? 'blocked' : 'unblocked'} successfully`,
      user: updatedUser,
    };
  }

  /**
   * Join event
   */
  async joinEvent(userId, eventId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Check if already joined
    if (user.joinedEvents && user.joinedEvents.includes(eventId)) {
      throw new BadRequestError('Event already joined');
    }

    const updatedUser = await userRepository.addJoinedEvent(userId, eventId);
    logger.info(`User ${userId} joined event ${eventId}`);

    return {
      message: 'Event joined successfully',
      user: updatedUser,
    };
  }

  /**
   * Unjoin event
   */
  async unjoinEvent(userId, eventId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const updatedUser = await userRepository.removeJoinedEvent(userId, eventId);
    logger.info(`User ${userId} unjoined event ${eventId}`);

    return {
      message: 'Unjoined successfully',
      user: updatedUser,
    };
  }

  /**
   * Get joined events
   */
  async getJoinedEvents(userId) {
    const user = await userRepository.findByIdWithEvents(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user.joinedEvents || [];
  }
}

module.exports = new UserService();

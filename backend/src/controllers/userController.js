const userService = require('../services/userService');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/response');

/**
 * User Controller - Handles user HTTP requests
 */
class UserController {
  /**
   * Get all users
   * GET /api/users
   */
  getAllUsers = asyncHandler(async (req, res) => {
    const users = await userService.getAllUsers();
    successResponse(res, { users }, 'Users fetched successfully');
  });

  /**
   * Get user profile by email
   * GET /api/profile/:email
   */
  getUserProfile = asyncHandler(async (req, res) => {
    const { email } = req.params;
    const user = await userService.getUserByEmail(email);
    successResponse(res, { user }, 'User profile fetched successfully');
  });

  /**
   * Update user profile
   * PUT /api/update-profile
   */
  updateProfile = asyncHandler(async (req, res) => {
    const { email, name, location } = req.body;
    const user = await userService.updateProfile(email, { name, location });
    successResponse(res, { user }, 'Profile updated successfully');
  });

  /**
   * Delete user
   * DELETE /api/users/:id
   */
  deleteUser = asyncHandler(async (req, res) => {
    const result = await userService.deleteUser(req.params.id);
    successResponse(res, result, result.message);
  });

  /**
   * Block/Unblock user
   * PATCH /api/users/:id/block
   */
  toggleBlockUser = asyncHandler(async (req, res) => {
    const { isBlocked } = req.body;
    const result = await userService.toggleBlockUser(req.params.id, isBlocked);
    successResponse(res, result, result.message);
  });

  /**
   * Join event
   * POST /api/join-event
   */
  joinEvent = asyncHandler(async (req, res) => {
    const { userId, eventId } = req.body;
    const result = await userService.joinEvent(userId, eventId);
    successResponse(res, result, result.message);
  });

  /**
   * Unjoin event
   * POST /api/unjoin-event
   */
  unjoinEvent = asyncHandler(async (req, res) => {
    const { userId, eventId } = req.body;
    const result = await userService.unjoinEvent(userId, eventId);
    successResponse(res, result, result.message);
  });

  /**
   * Get joined events
   * GET /api/joined-events
   */
  getJoinedEvents = asyncHandler(async (req, res) => {
    const { userId } = req.query;
    const events = await userService.getJoinedEvents(userId);
    successResponse(res, { events }, 'Joined events fetched successfully');
  });
}

module.exports = new UserController();

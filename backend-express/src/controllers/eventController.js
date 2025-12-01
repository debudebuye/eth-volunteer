const eventService = require('../services/eventService');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/response');
const { HTTP_STATUS } = require('../utils/constants');

/**
 * Event Controller - Handles event HTTP requests
 */
class EventController {
  /**
   * Create event
   * POST /api/events/create
   */
  createEvent = asyncHandler(async (req, res) => {
    const ngoId = req.user.id;
    
    // Handle both Cloudinary and local file paths
    const imagePath = req.file 
      ? (req.file.path || `/uploads/${req.file.filename}`) 
      : null;
    
    const eventData = {
      ...req.body,
      image: imagePath,
    };

    const result = await eventService.createEvent(eventData, ngoId);
    successResponse(res, result, result.message, HTTP_STATUS.CREATED);
  });

  /**
   * Get approved events
   * GET /api/events/approved
   */
  getApprovedEvents = asyncHandler(async (req, res) => {
    const events = await eventService.getApprovedEvents();
    successResponse(res, { events }, 'Approved events fetched successfully');
  });

  /**
   * Get pending events
   * GET /api/events/pending
   */
  getPendingEvents = asyncHandler(async (req, res) => {
    const events = await eventService.getPendingEvents();
    successResponse(res, { events }, 'Pending events fetched successfully');
  });

  /**
   * Get rejected events
   * GET /api/events/rejected
   */
  getRejectedEvents = asyncHandler(async (req, res) => {
    const events = await eventService.getRejectedEvents();
    successResponse(res, { events }, 'Rejected events fetched successfully');
  });

  /**
   * Get event by ID
   * GET /api/events/:eventId
   */
  getEventById = asyncHandler(async (req, res) => {
    const event = await eventService.getEventById(req.params.eventId);
    successResponse(res, { event }, 'Event fetched successfully');
  });

  /**
   * Get events by NGO
   * GET /api/events/events
   */
  getEventsByNGO = asyncHandler(async (req, res) => {
    const ngoId = req.user.id;
    const events = await eventService.getEventsByNGO(ngoId);
    successResponse(res, { events }, 'Events fetched successfully');
  });

  /**
   * Get events by NGO with details (tracking)
   * GET /api/events/track
   */
  getEventsByNGOWithDetails = asyncHandler(async (req, res) => {
    const ngoId = req.user.id;
    const events = await eventService.getEventsByNGOWithDetails(ngoId);
    successResponse(res, { events }, 'Events fetched successfully');
  });

  /**
   * Get events by location with pagination
   * GET /api/events/by-location?location=Addis&page=1&limit=20&status=approved
   */
  getEventsByLocation = asyncHandler(async (req, res) => {
    const { location, page, limit, status } = req.query;
    
    const options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      status: status || 'approved'
    };
    
    const result = await eventService.getEventsByLocation(location, options);
    successResponse(res, result, 'Events fetched successfully');
  });

  /**
   * Get followed events
   * GET /api/events/following
   */
  getFollowedEvents = asyncHandler(async (req, res) => {
    const { userId } = req.query;
    const events = await eventService.getFollowedEvents(userId);
    successResponse(res, { events }, 'Followed events fetched successfully');
  });

  /**
   * Approve event
   * PUT /api/events/approve/:id
   */
  approveEvent = asyncHandler(async (req, res) => {
    const result = await eventService.approveEvent(req.params.id);
    successResponse(res, result, result.message);
  });

  /**
   * Reject event
   * PUT /api/events/reject/:id
   */
  rejectEvent = asyncHandler(async (req, res) => {
    const result = await eventService.rejectEvent(req.params.id);
    successResponse(res, result, result.message);
  });

  /**
   * Disapprove event (move back to pending)
   * PUT /api/events/disapprove/:id
   */
  disapproveEvent = asyncHandler(async (req, res) => {
    const event = await eventService.moveToPending(req.params.id);
    successResponse(res, { event }, 'Event moved to pending successfully');
  });

  /**
   * Unreject event (move back to pending)
   * PUT /api/events/unreject/:id
   */
  unrejectEvent = asyncHandler(async (req, res) => {
    const event = await eventService.moveToPending(req.params.id);
    successResponse(res, { event }, 'Event moved to pending successfully');
  });

  /**
   * Update event
   * PUT /api/events/update/:eventId
   */
  updateEvent = asyncHandler(async (req, res) => {
    const ngoId = req.user.id;
    const result = await eventService.updateEvent(req.params.eventId, req.body, ngoId);
    successResponse(res, result, result.message);
  });

  /**
   * Delete event
   * DELETE /api/events/delete/:eventId
   */
  deleteEvent = asyncHandler(async (req, res) => {
    const ngoId = req.user.id;
    const result = await eventService.deleteEvent(req.params.eventId, ngoId);
    successResponse(res, result, result.message);
  });

  /**
   * Like event
   * POST /api/events/likes
   */
  likeEvent = asyncHandler(async (req, res) => {
    const { eventId, userId } = req.body;
    const result = await eventService.likeEvent(eventId, userId);
    successResponse(res, result, result.message);
  });

  /**
   * Unlike event
   * POST /api/events/unlike
   */
  unlikeEvent = asyncHandler(async (req, res) => {
    const { eventId, userId } = req.body;
    const result = await eventService.unlikeEvent(eventId, userId);
    successResponse(res, result, result.message);
  });

  /**
   * Follow event
   * POST /api/events/follow
   */
  followEvent = asyncHandler(async (req, res) => {
    const { eventId, userId } = req.body;
    const result = await eventService.followEvent(eventId, userId);
    successResponse(res, result, result.message);
  });

  /**
   * Add comment
   * POST /api/events/comment
   */
  addComment = asyncHandler(async (req, res) => {
    const { eventId, userId, text } = req.body;
    const result = await eventService.addComment(eventId, userId, text);
    successResponse(res, result, result.message, HTTP_STATUS.CREATED);
  });

  /**
   * Get comments
   * GET /api/events/:eventId/comments
   */
  getComments = asyncHandler(async (req, res) => {
    const comments = await eventService.getComments(req.params.eventId);
    successResponse(res, { comments }, 'Comments fetched successfully');
  });

  /**
   * Add reply to comment
   * POST /api/events/:eventId/comments/:commentId/reply
   */
  addReply = asyncHandler(async (req, res) => {
    const { eventId, commentId } = req.params;
    const { text } = req.body;
    const ngoId = req.user.id;
    
    const result = await eventService.addReply(eventId, commentId, ngoId, text);
    successResponse(res, result, result.message, HTTP_STATUS.CREATED);
  });
}

module.exports = new EventController();

const express = require('express');
const eventController = require('../controllers/eventController');
const { verifyToken, verifyNGO, verifyAdmin } = require('../../middleware/authMiddleware');
const { validateEventCreation, validateComment } = require('../../middleware/validator');
const upload = require('../../middleware/upload');

const router = express.Router();

// IMPORTANT: Specific routes MUST come before catch-all routes like /:eventId
// Otherwise Express will match /approve as /:eventId with eventId="approve"

// Public routes - specific paths first
router.get('/approved', eventController.getApprovedEvents);
router.get('/by-location', eventController.getEventsByLocation);
router.get('/following', eventController.getFollowedEvents);

// User routes (likes, comments, follow)
router.post('/likes', eventController.likeEvent);
router.post('/unlike', eventController.unlikeEvent);
router.post('/follow', eventController.followEvent);
router.post('/comment', validateComment, eventController.addComment);

// NGO routes
router.post(
  '/create',
  verifyToken,
  verifyNGO,
  upload.single('image'),
  validateEventCreation,
  eventController.createEvent
);

router.get(
  '/events',
  verifyToken,
  verifyNGO,
  eventController.getEventsByNGO
);

router.get(
  '/track',
  verifyToken,
  verifyNGO,
  eventController.getEventsByNGOWithDetails
);

router.put(
  '/update/:eventId',
  verifyToken,
  verifyNGO,
  eventController.updateEvent
);

router.delete(
  '/delete/:eventId',
  verifyToken,
  verifyNGO,
  eventController.deleteEvent
);

// Admin routes - must come before /:eventId catch-all
router.get(
  '/pending',
  verifyToken,
  verifyAdmin,
  eventController.getPendingEvents
);

router.get(
  '/rejected',
  verifyToken,
  verifyAdmin,
  eventController.getRejectedEvents
);

router.put(
  '/approve/:id',
  verifyToken,
  verifyAdmin,
  eventController.approveEvent
);

router.put(
  '/reject/:id',
  verifyToken,
  verifyAdmin,
  eventController.rejectEvent
);

router.put(
  '/disapprove/:id',
  verifyToken,
  verifyAdmin,
  eventController.disapproveEvent
);

router.put(
  '/unreject/:id',
  verifyToken,
  verifyAdmin,
  eventController.unrejectEvent
);

router.delete(
  '/admin/delete/:eventId',
  verifyToken,
  verifyAdmin,
  eventController.deleteEventByAdmin
);

// Comment like/unlike routes
router.post('/:eventId/comments/:commentId/like', eventController.likeComment);
router.post('/:eventId/comments/:commentId/unlike', eventController.unlikeComment);

// Comment edit/delete routes
router.put('/:eventId/comments/:commentId', eventController.updateComment);
router.delete('/:eventId/comments/:commentId', eventController.deleteComment);

// Catch-all routes - MUST be last to avoid matching specific routes
router.get('/:eventId', eventController.getEventById);
router.get('/:eventId/comments', eventController.getComments);
router.post('/:eventId/comments/:commentId/reply', eventController.addReply);

module.exports = router;

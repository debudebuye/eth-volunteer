const express = require('express');
const eventController = require('../controllers/eventController');
const { verifyToken, verifyNGO, isNGO, verifyAdmin, isAdmin } = require('../../middleware/authMiddleware');
const { validateEventCreation, validateComment } = require('../../middleware/validator');
const upload = require('../../middleware/upload');

const router = express.Router();

// Public routes
router.get('/approved', eventController.getApprovedEvents);
router.get('/by-location', eventController.getEventsByLocation);
router.get('/:eventId', eventController.getEventById);
router.get('/:eventId/comments', eventController.getComments);

// User routes (likes, comments, follow)
router.post('/likes', eventController.likeEvent);
router.post('/unlike', eventController.unlikeEvent);
router.post('/follow', eventController.followEvent);
router.post('/comment', validateComment, eventController.addComment);
router.get('/following', eventController.getFollowedEvents);

// NGO routes
router.post(
  '/create',
  verifyToken,
  verifyNGO,
  isNGO,
  upload.single('image'),
  validateEventCreation,
  eventController.createEvent
);

router.get(
  '/events',
  verifyToken,
  verifyNGO,
  isNGO,
  eventController.getEventsByNGO
);

router.get(
  '/track',
  verifyToken,
  verifyNGO,
  isNGO,
  eventController.getEventsByNGOWithDetails
);

router.put(
  '/update/:eventId',
  verifyToken,
  verifyNGO,
  isNGO,
  eventController.updateEvent
);

router.delete(
  '/delete/:eventId',
  verifyToken,
  verifyNGO,
  isNGO,
  eventController.deleteEvent
);

router.post(
  '/:eventId/comments/:commentId/reply',
  verifyToken,
  verifyNGO,
  isNGO,
  validateComment,
  eventController.addReply
);

// Admin routes
router.get(
  '/pending',
  verifyToken,
  verifyAdmin,
  isAdmin,
  eventController.getPendingEvents
);

router.get(
  '/rejected',
  verifyToken,
  verifyAdmin,
  isAdmin,
  eventController.getRejectedEvents
);

router.put(
  '/approve/:id',
  verifyToken,
  verifyAdmin,
  isAdmin,
  eventController.approveEvent
);

router.put(
  '/reject/:id',
  verifyToken,
  verifyAdmin,
  isAdmin,
  eventController.rejectEvent
);

router.put(
  '/disapprove/:id',
  verifyToken,
  verifyAdmin,
  isAdmin,
  eventController.disapproveEvent
);

router.put(
  '/unreject/:id',
  verifyToken,
  verifyAdmin,
  isAdmin,
  eventController.unrejectEvent
);

module.exports = router;

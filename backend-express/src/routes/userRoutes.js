const express = require('express');
const userController = require('../controllers/userController');
const { verifyToken, verifyAdmin } = require('../../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/users', userController.getAllUsers);
router.get('/profile/:email', userController.getUserProfile);
router.put('/update-profile', userController.updateProfile);

// Admin protected routes
router.delete('/:id', verifyToken, verifyAdmin, userController.deleteUser);
router.patch('/:id/block', verifyToken, verifyAdmin, userController.toggleBlockUser);

// Event-related user routes
router.post('/join-event', userController.joinEvent);
router.post('/unjoin-event', userController.unjoinEvent);
router.get('/joined-events', userController.getJoinedEvents);

module.exports = router;

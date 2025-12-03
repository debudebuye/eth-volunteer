const express = require('express');
const cacheController = require('../controllers/cacheController');
const { verifyToken, verifyAdmin } = require('../../middleware/authMiddleware');

const router = express.Router();

// Admin only routes
router.get('/stats', verifyToken, verifyAdmin, cacheController.getStats);
router.delete('/clear', verifyToken, verifyAdmin, cacheController.clearCache);
router.delete('/pattern/:pattern', verifyToken, verifyAdmin, cacheController.deletePattern);

module.exports = router;

const express = require('express');
const ngoController = require('../controllers/ngoController');
const { verifyToken } = require('../../middleware/authMiddleware');

const router = express.Router();

// All NGO routes require authentication
router.get('/ngo-users', ngoController.getAllNGOs);
router.delete('/ngo-users/:id', verifyToken, ngoController.deleteNGO);
router.patch('/ngo-users/:id', verifyToken, ngoController.updateNGOStatus);

module.exports = router;

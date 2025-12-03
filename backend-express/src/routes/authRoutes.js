const express = require('express');
const authController = require('../controllers/authController');
const { validateUserRegistration, validateNGORegistration, validateLogin } = require('../../middleware/validator');
const { registerLimiter, authLimiter } = require('../../middleware/rateLimiter');

const router = express.Router();

/**
 * @swagger
 * /api/auth/register/volunteer:
 *   post:
 *     summary: Register a new volunteer
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: Password123
 *               location:
 *                 type: string
 *                 example: Addis Ababa
 *     responses:
 *       201:
 *         description: Volunteer registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Email already exists
 */
router.post(
  '/register/volunteer',
  registerLimiter,
  validateUserRegistration,
  authController.registerVolunteer
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login as volunteer
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Account blocked
 */
router.post(
  '/login',
  authLimiter,
  validateLogin,
  authController.loginVolunteer
);

/**
 * @swagger
 * /api/auth/register/ngo:
 *   post:
 *     summary: Register a new NGO
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - organization
 *             properties:
 *               name:
 *                 type: string
 *                 example: Jane Smith
 *               email:
 *                 type: string
 *                 format: email
 *                 example: jane@ngo.org
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: Password123
 *               organization:
 *                 type: string
 *                 example: Help Ethiopia NGO
 *     responses:
 *       201:
 *         description: NGO registered successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email already exists
 */
router.post(
  '/register/ngo',
  registerLimiter,
  validateNGORegistration,
  authController.registerNGO
);

/**
 * @swagger
 * /api/auth/login-ngo:
 *   post:
 *     summary: Login as NGO
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: jane@ngo.org
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                     ngo:
 *                       $ref: '#/components/schemas/NGO'
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Account blocked
 */
router.post(
  '/login-ngo',
  authLimiter,
  validateLogin,
  authController.loginNGO
);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token using refresh token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                     user:
 *                       type: object
 *       401:
 *         description: Invalid or expired refresh token
 *       400:
 *         description: Refresh token is required
 */
router.post(
  '/refresh',
  authLimiter,
  authController.refreshToken
);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user (clears HttpOnly cookies)
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post(
  '/logout',
  authController.logout
);

/**
 * @swagger
 * /api/auth/check-email:
 *   get:
 *     summary: Check if email is available for registration
 *     tags: [Authentication]
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *         description: Email to check
 *     responses:
 *       200:
 *         description: Email availability status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     available:
 *                       type: boolean
 *                     message:
 *                       type: string
 *                     accountType:
 *                       type: string
 *                       enum: [volunteer, NGO, admin]
 *       400:
 *         description: Email parameter is required
 */
router.get(
  '/check-email',
  authController.checkEmail
);

module.exports = router;

/**
 * @swagger
 * /api/events/approved:
 *   get:
 *     summary: Get all approved events
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: List of approved events
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
 *                     events:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Event'
 */

/**
 * @swagger
 * /api/events/create:
 *   post:
 *     summary: Create a new event (NGO only)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - date
 *               - location
 *               - creatorEmail
 *               - creatorName
 *             properties:
 *               name:
 *                 type: string
 *                 example: Community Cleanup
 *               description:
 *                 type: string
 *                 example: Help clean our community park
 *               date:
 *                 type: string
 *                 format: date
 *                 example: 2025-12-01
 *               location:
 *                 type: string
 *                 example: Addis Ababa
 *               creatorEmail:
 *                 type: string
 *                 format: email
 *                 example: ngo@example.com
 *               creatorName:
 *                 type: string
 *                 example: NGO Name
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Event created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - NGO only
 */

/**
 * @swagger
 * /api/events/pending:
 *   get:
 *     summary: Get all pending events (Admin only)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending events
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */

/**
 * @swagger
 * /api/events/approve/{id}:
 *   put:
 *     summary: Approve an event (Admin only)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event approved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 *       404:
 *         description: Event not found
 */

/**
 * @swagger
 * /api/events/reject/{id}:
 *   put:
 *     summary: Reject an event (Admin only)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event rejected successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 *       404:
 *         description: Event not found
 */

/**
 * @swagger
 * /api/events/{eventId}:
 *   get:
 *     summary: Get event by ID
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event details
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
 *                     event:
 *                       $ref: '#/components/schemas/Event'
 *       404:
 *         description: Event not found
 */

/**
 * @swagger
 * /api/events/likes:
 *   post:
 *     summary: Like an event
 *     tags: [Events]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - eventId
 *               - userId
 *             properties:
 *               eventId:
 *                 type: string
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Event liked successfully
 *       400:
 *         description: Already liked
 *       404:
 *         description: Event not found
 */

/**
 * @swagger
 * /api/events/comment:
 *   post:
 *     summary: Add a comment to an event
 *     tags: [Events]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - eventId
 *               - userId
 *               - text
 *             properties:
 *               eventId:
 *                 type: string
 *               userId:
 *                 type: string
 *               text:
 *                 type: string
 *                 maxLength: 500
 *     responses:
 *       201:
 *         description: Comment added successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Event not found
 */

module.exports = {};

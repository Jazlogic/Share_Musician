import { Router } from 'express';
import { createRequestController, getCreatedRequestsController } from '../controllers/requestController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Requests
 *   description: API for managing music requests
 */

/**
 * @swagger
 * /requests:
 *   post:
 *     summary: Create a new music request
 *     tags: [Requests]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - client_id
 *               - musician_id
 *               - genre
 *               - description
 *               - start_time
 *               - end_time
 *               - event_date
 *               - event_duration
 *               - location
 *               - payment_amount
 *               - status
 *             properties:
 *               client_id:
 *                 type: string
 *                 format: uuid
 *                 description: The ID of the client making the request.
 *               musician_id:
 *                 type: string
 *                 format: uuid
 *                 description: The ID of the musician being requested.
 *               genre:
 *                 type: string
 *                 description: The music genre requested.
 *               description:
 *                 type: string
 *                 description: A detailed description of the request.
 *               start_time:
 *                 type: string
 *                 format: time
 *                 description: The start time of the event.
 *               end_time:
 *                 type: string
 *                 format: time
 *                 description: The end time of the event.
 *               event_date:
 *                 type: string
 *                 format: date
 *                 description: The date of the event.
 *               event_duration:
 *                 type: string
 *                 description: The duration of the event (e.g., '2 hours').
 *               location:
 *                 type: string
 *                 description: The location of the event.
 *               payment_amount:
 *                 type: number
 *                 format: float
 *                 description: The agreed payment amount.
 *               status:
 *                 type: string
 *                 enum: [pending, accepted, rejected, completed, cancelled]
 *                 description: The current status of the request.
 *     responses:
 *       201:
 *         description: The music request was successfully created.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Music request created successfully.
 *                 request:
 *                   type: object
 *                   description: The created request object.
 *       400:
 *         description: Invalid input or missing required fields.
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Some server error.
 */
router.post('/', authenticateToken, createRequestController);

/**
 * @swagger
 * /requests/created:
 *   get:
 *     summary: Get music requests with 'CREATED' status, visible to all musicians and to the leaders who created them.
 *     tags: [Requests]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: A list of music requests with 'CREATED' status.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   request_id:
 *                     type: string
 *                     format: uuid
 *                   client_id:
 *                     type: string
 *                     format: uuid
 *                   musician_id:
 *                     type: string
 *                     format: uuid
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 *                   category:
 *                     type: string
 *                   location:
 *                     type: string
 *                   event_date:
 *                     type: string
 *                     format: date
 *                   start_time:
 *                     type: string
 *                     format: time
 *                   end_time:
 *                     type: string
 *                     format: time
 *                   price:
 *                     type: number
 *                     format: float
 *                   status:
 *                     type: string
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Some server error.
 */
router.get('/created', authenticateToken, getCreatedRequestsController);

export default router;
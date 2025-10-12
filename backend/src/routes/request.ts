import { Router } from 'express';
import { createRequestController, getCreatedRequestsController, getEventTypesController, getRequestByIdController } from '../controllers/requestController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Request
 *   description: API for managing music requests
 */

/**
 * @swagger
 * /request:
 *   post:
 *     summary: Create a new music request
 *     tags: [Request]
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
 *               - title
 *               - category
 *               - event_date
 *               - start_time
 *               - end_time
 *               - location
 *               - price
 *             properties:
 *               client_id:
 *                 type: string
 *                 format: uuid
 *                 description: The ID of the client making the request.
 *               title:
 *                 type: string
 *                 description: The title of the music request.
 *               description:
 *                 type: string
 *                 description: A detailed description of the request.
 *               category:
 *                 type: string
 *                 description: The category of the event (e.g., 'Wedding', 'Concert').
 *               instrument:
 *                 type: string
 *                 description: The instrument required for the event (e.g., 'Guitar', 'Piano').
 *               event_date:
 *                 type: string
 *                 format: date
 *                 description: The date of the event.
 *               start_time:
 *                 type: string
 *                 format: time
 *                 description: The start time of the event.
 *               end_time:
 *                 type: string
 *                 format: time
 *                 description: The end time of the event.
 *               location:
 *                 type: object
 *                 description: The location of the event (JSON object).
 *               price:
 *                 type: number
 *                 format: float
 *                 description: The total price of the request.
 */
router.post('/', authenticateToken, createRequestController);

/**
 * @swagger
 * /request/created:
 *   get:
 *     summary: Get music requests with 'CREATED' status, visible to all musicians and to the leaders who created them.
 *     tags: [Request]
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

/**
 * @swagger
 * /request/event-types:
 *   get:
 *     summary: Get all available event types
 *     tags: [Request]
 *     responses:
 *       200:
 *         description: A list of event types.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     format: uuid
 *                   name:
 *                     type: string
 *       500:
 *         description: Some server error.
 */
router.get('/event-types', getEventTypesController);

/**
 * @swagger
 * /request/{id}:
 *   get:
 *     summary: Get a single music request by ID
 *     tags: [Request]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: The ID of the request to retrieve.
 *     responses:
 *       200:
 *         description: Details of the music request.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 client_id:
 *                   type: string
 *                   format: uuid
 *                 musician_id:
 *                   type: string
 *                   format: uuid
 *                 title:
 *                   type: string
 *                 description:
 *                   type: string
 *                 category:
 *                   type: string
 *                 location:
 *                   type: object
 *                 event_date:
 *                   type: string
 *                   format: date
 *                 start_time:
 *                   type: string
 *                   format: time
 *                 end_time:
 *                   type: string
 *                   format: time
 *                 price:
 *                   type: number
 *                   format: float
 *                 status:
 *                   type: string
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                 updated_at:
 *                   type: string
 *                   format: date-time
 *                 is_public:
 *                   type: boolean
 *                 cancelled_by:
 *                   type: string
 *                   format: uuid
 *                 cancellation_reason:
 *                   type: string
 *                 reopened_from_id:
 *                   type: string
 *                   format: uuid
 *                 instruments:
 *                   type: array
 *                   items:
 *                     type: string
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Request not found.
 *       500:
 *         description: Some server error.
 */
router.get('/:id', authenticateToken, getRequestByIdController);

export default router;
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
 *               - leader_id
 *               - event_type_id
 *               - event_date
 *               - start_time
 *               - end_time
 *               - location
 *             properties:
 *               leader_id:
 *                 type: string
 *                 format: uuid
 *                 description: The ID of the leader making the request.
 *               event_type_id:
 *                 type: string
 *                 format: uuid
 *                 description: The ID of the event type.
 *               description:
 *                 type: string
 *                 description: A detailed description of the request.
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
 *               instrument_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 description: An array of instrument IDs required for the event.
 *               duration:
 *                 type: string
 *                 description: The duration of the event (e.g., '2 hours').
 *               base_rate:
 *                 type: number
 *                 format: float
 *                 description: The base rate for the request.
 *               duration_hours:
 *                 type: number
 *                 format: float
 *                 description: The duration of the event in hours.
 *               distance_km:
 *                 type: number
 *                 format: float
 *                 description: The distance to the event in kilometers.
 *               experience_factor:
 *                 type: number
 *                 format: float
 *                 description: Factor based on musician experience.
 *               instrument_factor:
 *                 type: number
 *                 format: float
 *                 description: Factor based on instrument rarity/demand.
 *               system_fee:
 *                 type: number
 *                 format: float
 *                 description: System fee applied to the request.
 *               total_price:
 *                 type: number
 *                 format: float
 *                 description: The total price of the request.
 *               extra_amount:
 *                 type: number
 *                 format: float
 *                 description: Any extra amount added to the request.
 *               is_public:
 *                 type: boolean
 *                 description: Whether the request is public or private.
 *               status:
 *                 type: string
 *                 enum: [CREATED, PENDING, ACCEPTED, REJECTED, COMPLETED, CANCELLED]
 *                 description: The current status of the request.
 *               cancelled_by:
 *                 type: string
 *                 format: uuid
 *                 description: The ID of the user who cancelled the request.
 *               cancellation_reason:
 *                 type: string
 *                 description: The reason for cancellation.
 *               reopened_from_id:
 *                 type: string
 *                 format: uuid
 *                 description: The ID of the request this one was reopened from.
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
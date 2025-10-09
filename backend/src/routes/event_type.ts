import { Router } from 'express';
import { getEventTypes } from '../controllers/event_typeController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Event Types
 *   description: API for managing event types
 */

/**
 * @swagger
 * /event-types:
 *   get:
 *     summary: Retrieve a list of all available event types
 *     tags: [Event Types]
 *     security:
 *       - BearerAuth: []
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
 *                     description: The event type ID.
 *                   name:
 *                     type: string
 *                     description: The name of the event type.
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal server error.
 */
router.get('/', authenticateToken, getEventTypes);

export default router;
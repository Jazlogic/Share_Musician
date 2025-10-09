import { Router } from 'express';
import { getInstruments } from '../controllers/instrumentController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Instruments
 *   description: API for managing instruments
 */

/**
 * @swagger
 * /instruments:
 *   get:
 *     summary: Retrieve a list of all available instruments
 *     tags: [Instruments]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: A list of instruments.
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
 *                     description: The instrument ID.
 *                   name:
 *                     type: string
 *                     description: The name of the instrument.
 *                   category:
 *                     type: string
 *                     description: The category of the instrument (e.g., 'Strings', 'Percussion').
 *                   icon:
 *                     type: string
 *                     description: URL or name of the icon representing the instrument.
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal server error.
 */
router.get('/', authenticateToken, getInstruments);

export default router;
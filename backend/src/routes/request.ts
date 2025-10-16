import { Router } from 'express';
import { createRequestController, getCreatedRequestsController, getEventTypesController, getInstrumentsController, getRequestByIdController } from '../controllers/requestController';
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
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - category
 *               - instrument
 *               - event_date
 *               - start_time
 *               - end_time
 *               - location
 *             properties:
 *               title:
 *                 type: string
 *                 description: Título de la solicitud musical
 *                 example: "Concierto Benéfico"
 *               description:
 *                 type: string
 *                 description: Descripción detallada de la solicitud
 *                 example: "Necesitamos música para evento benéfico en el parque central"
 *               category:
 *                 type: string
 *                 description: Categoría del evento (ej. 'Concierto', 'Boda', 'Fiesta Privada')
 *                 example: "Concierto"
 *               instrument:
 *                 type: string
 *                 description: Instrumento requerido (ej. 'Guitarra Acústica', 'Piano', 'Batería')
 *                 example: "Guitarra Acústica"
 *               event_date:
 *                 type: string
 *                 format: date
 *                 description: Fecha del evento (YYYY-MM-DD)
 *                 example: "2025-10-25"
 *               start_time:
 *                 type: string
 *                 format: time
 *                 description: Hora de inicio del evento (HH:MM:SS)
 *                 example: "19:00:00"
 *               end_time:
 *                 type: string
 *                 format: time
 *                 description: Hora de finalización del evento (HH:MM:SS)
 *                 example: "22:00:00"
 *               location:
 *                 type: string
 *                 description: Ubicación del evento en formato JSON
 *                 example: '{"address": "Parque Central, Santo Domingo", "latitude": 18.48605, "longitude": -69.93121}'
 *               is_public:
 *                 type: boolean
 *                 description: Si la solicitud es pública o privada
 *                 example: true
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - category
 *               - instrument
 *               - event_date
 *               - start_time
 *               - end_time
 *               - location
 *             properties:
 *               title:
 *                 type: string
 *                 description: Título de la solicitud musical
 *                 example: "Concierto Benéfico"
 *               description:
 *                 type: string
 *                 description: Descripción detallada de la solicitud
 *                 example: "Necesitamos música para evento benéfico en el parque central"
 *               category:
 *                 type: string
 *                 description: Categoría del evento (ej. 'Concierto', 'Boda', 'Fiesta Privada')
 *                 example: "Concierto"
 *               instrument:
 *                 type: string
 *                 description: Instrumento requerido (ej. 'Guitarra Acústica', 'Piano', 'Batería')
 *                 example: "Guitarra Acústica"
 *               event_date:
 *                 type: string
 *                 format: date
 *                 description: Fecha del evento (YYYY-MM-DD)
 *                 example: "2025-10-25"
 *               start_time:
 *                 type: string
 *                 format: time
 *                 description: Hora de inicio del evento (HH:MM:SS)
 *                 example: "19:00:00"
 *               end_time:
 *                 type: string
 *                 format: time
 *                 description: Hora de finalización del evento (HH:MM:SS)
 *                 example: "22:00:00"
 *               location:
 *                 type: object
 *                 description: Ubicación del evento
 *                 properties:
 *                   address:
 *                     type: string
 *                     example: "Parque Central, Santo Domingo"
 *                   latitude:
 *                     type: number
 *                     example: 18.48605
 *                   longitude:
 *                     type: number
 *                     example: -69.93121
 *               is_public:
 *                 type: boolean
 *                 description: Si la solicitud es pública o privada
 *                 example: true
 *     responses:
 *       201:
 *         description: Solicitud creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 title:
 *                   type: string
 *                 total_price:
 *                   type: number
 *                   format: float
 *                 status:
 *                   type: string
 *                   example: "CREATED"
 *       400:
 *         description: Datos inválidos o campos faltantes
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Solo clientes y músicos pueden crear solicitudes
 *       500:
 *         description: Error interno del servidor
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
 *                   price_factor:
 *                     type: number
 *                     format: float
 *       500:
 *         description: Some server error.
 */
router.get('/event-types', getEventTypesController);

/**
 * @swagger
 * /request/instruments:
 *   get:
 *     summary: Get all available instruments
 *     tags: [Request]
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
 *                   name:
 *                     type: string
 *                   category:
 *                     type: string
 *                   price_factor:
 *                     type: number
 *                     format: float
 *       500:
 *         description: Some server error.
 */
router.get('/instruments', getInstrumentsController);

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
 *         description: The ID of the request to retrieve
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Details of the music request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                   example: "123e4567-e89b-12d3-a456-426614174000"
 *                 client_id:
 *                   type: string
 *                   format: uuid
 *                 musician_id:
 *                   type: string
 *                   format: uuid
 *                   nullable: true
 *                 title:
 *                   type: string
 *                   example: "Concierto Benéfico"
 *                 description:
 *                   type: string
 *                   example: "Necesitamos música para evento benéfico"
 *                 category:
 *                   type: string
 *                   example: "Concierto"
 *                 location:
 *                   type: object
 *                   properties:
 *                     address:
 *                       type: string
 *                       example: "Parque Central, Santo Domingo"
 *                     latitude:
 *                       type: number
 *                       example: 18.48605
 *                     longitude:
 *                       type: number
 *                       example: -69.93121
 *                 total_price:
 *                   type: number
 *                   format: float
 *                   example: 450.00
 *                 distance_km:
 *                   type: number
 *                   format: float
 *                   example: 10.5
 *                 event_date:
 *                   type: string
 *                   format: date
 *                   example: "2025-10-25"
 *                 start_time:
 *                   type: string
 *                   format: time
 *                   example: "19:00:00"
 *                 end_time:
 *                   type: string
 *                   format: time
 *                   example: "22:00:00"
 *                 status:
 *                   type: string
 *                   enum: [CREATED, OFFER_RECEIVED, OFFER_ACCEPTED, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED_BY_CLIENT, CANCELLED_BY_MUSICIAN, EXPIRED, ARCHIVED]
 *                   example: "CREATED"
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                 updated_at:
 *                   type: string
 *                   format: date-time
 *                 is_public:
 *                   type: boolean
 *                   example: true
 *                 cancelled_by:
 *                   type: string
 *                   format: uuid
 *                   nullable: true
 *                 cancellation_reason:
 *                   type: string
 *                   nullable: true
 *                 reopened_from_id:
 *                   type: string
 *                   format: uuid
 *                   nullable: true
 *                 instruments:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Guitarra Acústica", "Piano"]
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Request not found
 *       500:
 *         description: Some server error
 */
router.get('/:id', authenticateToken, getRequestByIdController);

export default router;
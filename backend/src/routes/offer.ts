import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Offers
 *   description: API para gestionar ofertas de músicos
 */

/**
 * @swagger
 * /offer:
 *   post:
 *     summary: Crear nueva oferta para una solicitud
 *     tags: [Offers]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - request_id
 *               - price
 *               - message
 *             properties:
 *               request_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID de la solicitud a la que se hace la oferta
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               price:
 *                 type: number
 *                 format: float
 *                 description: Precio propuesto por el músico
 *                 example: 450.00
 *               message:
 *                 type: string
 *                 description: Mensaje del músico al cliente
 *                 example: "Me interesa mucho esta solicitud. Tengo experiencia con guitarra acústica."
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - request_id
 *               - price
 *               - message
 *             properties:
 *               request_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID de la solicitud a la que se hace la oferta
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               price:
 *                 type: number
 *                 format: float
 *                 description: Precio propuesto por el músico
 *                 example: 450.00
 *               message:
 *                 type: string
 *                 description: Mensaje del músico al cliente
 *                 example: "Me interesa mucho esta solicitud. Tengo experiencia con guitarra acústica."
 *     responses:
 *       201:
 *         description: Oferta creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 request_id:
 *                   type: string
 *                   format: uuid
 *                 musician_id:
 *                   type: string
 *                   format: uuid
 *                 price:
 *                   type: number
 *                   format: float
 *                 message:
 *                   type: string
 *                 status:
 *                   type: string
 *                   example: "SENT"
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Datos inválidos o solicitud no encontrada
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Solo músicos pueden crear ofertas
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /offer/{id}:
 *   get:
 *     summary: Obtener oferta por ID
 *     tags: [Offers]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID de la oferta
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Detalles de la oferta
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 request_id:
 *                   type: string
 *                   format: uuid
 *                 musician_id:
 *                   type: string
 *                   format: uuid
 *                 price:
 *                   type: number
 *                   format: float
 *                 message:
 *                   type: string
 *                 status:
 *                   type: string
 *                   enum: [SENT, ACCEPTED, REJECTED, WITHDRAWN, SELECTED]
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                 updated_at:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Oferta no encontrada
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /offer/{id}/accept:
 *   post:
 *     summary: Aceptar una oferta
 *     tags: [Offers]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID de la oferta a aceptar
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Oferta aceptada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Oferta aceptada exitosamente"
 *                 offer:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     status:
 *                       type: string
 *                       example: "ACCEPTED"
 *       400:
 *         description: Oferta no puede ser aceptada
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Solo el cliente de la solicitud puede aceptar ofertas
 *       404:
 *         description: Oferta no encontrada
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /offer/{id}/reject:
 *   post:
 *     summary: Rechazar una oferta
 *     tags: [Offers]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID de la oferta a rechazar
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Oferta rechazada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Oferta rechazada exitosamente"
 *                 offer:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     status:
 *                       type: string
 *                       example: "REJECTED"
 *       400:
 *         description: Oferta no puede ser rechazada
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Solo el cliente de la solicitud puede rechazar ofertas
 *       404:
 *         description: Oferta no encontrada
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /offer/request/{requestId}:
 *   get:
 *     summary: Obtener todas las ofertas de una solicitud
 *     tags: [Offers]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID de la solicitud
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Lista de ofertas para la solicitud
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
 *                   request_id:
 *                     type: string
 *                     format: uuid
 *                   musician_id:
 *                     type: string
 *                     format: uuid
 *                   musician_name:
 *                     type: string
 *                   price:
 *                     type: number
 *                     format: float
 *                   message:
 *                     type: string
 *                   status:
 *                     type: string
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tienes permisos para ver estas ofertas
 *       404:
 *         description: Solicitud no encontrada
 *       500:
 *         description: Error interno del servidor
 */

// TODO: Implementar controladores para ofertas
// router.post('/', authenticateToken, createOfferController);
// router.get('/:id', authenticateToken, getOfferByIdController);
// router.post('/:id/accept', authenticateToken, acceptOfferController);
// router.post('/:id/reject', authenticateToken, rejectOfferController);
// router.get('/request/:requestId', authenticateToken, getOffersByRequestController);

export default router;


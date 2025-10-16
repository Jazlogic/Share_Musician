import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: API para gestionar notificaciones de usuarios
 */

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Obtener notificaciones del usuario autenticado
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: unread_only
 *         schema:
 *           type: boolean
 *         description: Si se debe mostrar solo notificaciones no leídas
 *         example: false
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Número máximo de notificaciones a devolver
 *         example: 20
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Número de notificaciones a omitir
 *         example: 0
 *     responses:
 *       200:
 *         description: Lista de notificaciones del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 notifications:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       user_id:
 *                         type: string
 *                         format: uuid
 *                       type:
 *                         type: string
 *                         enum: [SYSTEM, MESSAGE, ALERT]
 *                       title:
 *                         type: string
 *                         example: "Nueva Solicitud Disponible"
 *                       message:
 *                         type: string
 *                         example: "Hay una nueva solicitud que podría interesarte"
 *                       link:
 *                         type: string
 *                         example: "/requests/123e4567-e89b-12d3-a456-426614174000"
 *                       is_read:
 *                         type: boolean
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                 total_count:
 *                   type: integer
 *                   description: Número total de notificaciones
 *                 unread_count:
 *                   type: integer
 *                   description: Número de notificaciones no leídas
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /notifications/{id}/read:
 *   post:
 *     summary: Marcar notificación como leída
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID de la notificación
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Notificación marcada como leída
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Notificación marcada como leída"
 *                 notification:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     is_read:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Notificación ya está marcada como leída
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tienes permisos para acceder a esta notificación
 *       404:
 *         description: Notificación no encontrada
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /notifications/read-all:
 *   post:
 *     summary: Marcar todas las notificaciones como leídas
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Todas las notificaciones marcadas como leídas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Todas las notificaciones han sido marcadas como leídas"
 *                 updated_count:
 *                   type: integer
 *                   description: Número de notificaciones actualizadas
 *                   example: 5
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /notifications/{id}:
 *   delete:
 *     summary: Eliminar notificación
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID de la notificación a eliminar
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Notificación eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Notificación eliminada exitosamente"
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tienes permisos para eliminar esta notificación
 *       404:
 *         description: Notificación no encontrada
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /notifications/stats:
 *   get:
 *     summary: Obtener estadísticas de notificaciones del usuario
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas de notificaciones
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total_notifications:
 *                   type: integer
 *                   description: Total de notificaciones
 *                 unread_notifications:
 *                   type: integer
 *                   description: Notificaciones no leídas
 *                 notifications_by_type:
 *                   type: object
 *                   properties:
 *                     SYSTEM:
 *                       type: integer
 *                       description: Notificaciones del sistema
 *                     MESSAGE:
 *                       type: integer
 *                       description: Notificaciones de mensajes
 *                     ALERT:
 *                       type: integer
 *                       description: Notificaciones de alerta
 *                 recent_notifications:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       title:
 *                         type: string
 *                       type:
 *                         type: string
 *                       is_read:
 *                         type: boolean
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */

// TODO: Implementar controladores para notificaciones
// router.get('/', authenticateToken, getNotificationsController);
// router.post('/:id/read', authenticateToken, markNotificationAsReadController);
// router.post('/read-all', authenticateToken, markAllNotificationsAsReadController);
// router.delete('/:id', authenticateToken, deleteNotificationController);
// router.get('/stats', authenticateToken, getNotificationStatsController);

export default router;


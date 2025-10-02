import { Router } from 'express';

const router = Router();

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *                 description: ID del usuario que crea el post.
 *               content:
 *                 type: string
 *                 description: Contenido del post.
 *               postKey:
 *                 type: string
 *                 description: Clave del archivo asociado al post en el bucket de iDrive e2 (opcional).
 *             required:
 *               - userId
 *               - content
 *     responses:
 *       201:
 *         description: El post fue creado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Post creado exitosamente.
 *                 post:
 *                   type: object
 *                   properties:
 *                     post_id:
 *                       type: string
 *                       format: uuid
 *                     userId:
 *                       type: string
 *                       format: uuid
 *                     content:
 *                       type: string
 *                     postKey:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Solicitud inválida.
 *       500:
 *         description: Error del servidor.
 */
router.post('/', (req, res) => {
  res.status(501).json({ message: 'Not Implemented' });
});

export default router;
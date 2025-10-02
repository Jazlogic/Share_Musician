import { Router } from 'express';
import { storageController } from '../controllers/storageController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Storage
 *   description: Endpoints para la gestión de almacenamiento de archivos (iDrive e2)
 */

/**
 * @swagger
 * /storage/upload-url:
 *   get:
 *     summary: Obtiene una URL firmada para subir un archivo a iDrive e2.
 *     tags: [Storage]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [profile, post]
 *         required: true
 *         description: Tipo de archivo a subir (profile o post).
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: ID del usuario asociado al archivo (requerido para tipo 'profile').
 *       - in: query
 *         name: fileType
 *         schema:
 *           type: string
 *         required: true
 *         description: Tipo MIME del archivo (ej. image/jpeg).
 *     responses:
 *       200:
 *         description: URL firmada para subir el archivo y la clave del archivo.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 uploadURL:
 *                   type: string
 *                   description: URL firmada para la subida.
 *                 key:
 *                   type: string
 *                   description: Clave del archivo en el bucket.
 *       400:
 *         description: Parámetros de consulta inválidos.
 *       401:
 *         description: No autorizado.
 *       500:
 *         description: Error del servidor.
 */
router.get('/upload-url', authenticateToken, storageController.getUploadUrl);

/**
 * @swagger
 * /storage/download-url:
 *   get:
 *     summary: Obtiene una URL firmada para descargar un archivo de iDrive e2.
 *     tags: [Storage]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: key
 *         schema:
 *           type: string
 *         required: true
 *         description: Clave del archivo en el bucket de iDrive e2.
 *     responses:
 *       200:
 *         description: URL firmada para descargar el archivo.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 downloadURL:
 *                   type: string
 *                   description: URL firmada para la descarga.
 *       400:
 *         description: Parámetro 'key' faltante.
 *       401:
 *         description: No autorizado.
 *       500:
 *         description: Error del servidor.
 */
router.get('/download-url', authenticateToken, storageController.getDownloadUrl);

export default router;
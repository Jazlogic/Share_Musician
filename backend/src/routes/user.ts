import { Router, Request, Response, NextFunction } from 'express';
import { MulterError } from 'multer';
import {
  createUserController,
  getUsersController,
  getUserByIdController,
  updateUserController,
  deleteUserController,
  verifyEmailController,
  updateProfileKeyController,
  uploadProfileImageController,
  getProfileImageController,
  getProfileImageHistoryController,
  selectProfileImageFromHistoryController,
  serveProfileImage,
} from '../controllers/userController';
import { authenticateToken } from '../middleware/authMiddleware';
import { getUserById } from '../services/userService';
import multer from 'multer';

// Configuración de Multer para manejar la subida de archivos en memoria
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Extender la interfaz Request de Express para incluir la propiedad file
declare module 'express' {
  export interface Request {
    file?: Express.Multer.File;
  }
}

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: API for managing users
 */

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: The user was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       500:
 *         description: Some server error
 */
router.post('/', createUserController);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Returns the list of all users
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: The list of the users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
router.get('/', authenticateToken, getUsersController);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get a user by id
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The user id
 *     responses:
 *       200:
 *         description: The user description by id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: The user was not found
 */
router.get('/:id', authenticateToken, getUserByIdController);

/**
 * @swagger
 * /users/debug/all:
 *   get:
 *     summary: Get all users (debug endpoint)
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
router.get('/debug/all', authenticateToken, getUsersController);

/**
 * @swagger
 * /users/verify-token:
 *   get:
 *     summary: Verify if the current token is valid
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Token is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Token is invalid or expired
 *       404:
 *         description: User not found
 */
router.get('/verify-token', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'No user ID in token' });
    }

    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found', valid: false });
    }

    res.status(200).json({ 
      valid: true, 
      user: user,
      message: 'Token is valid' 
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message, valid: false });
  }
});

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update a user by id
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The user id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: The user was updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: The user was not found
 *       500:
 *         description: Some error happened
 */
router.put('/:id', authenticateToken, updateUserController);

/**
 * @swagger
 * /users/{id}/profile-image:
 *   post:
 *     summary: Sube una imagen de perfil para un usuario y actualiza su profileKey.
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: El ID del usuario.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profileImage:
 *                 type: string
 *                 format: binary
 *                 description: El archivo de imagen de perfil a subir.
 *     responses:
 *       200:
 *         description: Imagen de perfil subida y profileKey actualizada correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Imagen de perfil subida y actualizada correctamente.
 *                 profileKey:
 *                   type: string
 *                   description: La nueva clave de la foto de perfil.
 *       400:
 *         description: Solicitud inválida o no se proporcionó ningún archivo.
 *       401:
 *         description: No autorizado.
 *       404:
 *         description: El usuario no fue encontrado o no se pudo actualizar la profileKey.
 *       500:
 *         description: Error del servidor.
 */
router.post('/:id/profile-image', authenticateToken, upload.single('profileImage'), (err: any, req: Request, res: Response, next: NextFunction) => {
  
  if (err instanceof MulterError) {
    console.error('Multer Error:', err);
    return res.status(400).json({ message: err.message });
  } else if (err) {
    console.error('Unknown File Upload Error:', err);
    return res.status(500).json({ message: 'An unknown error occurred during file upload.' });
  }
  next();
}, uploadProfileImageController);

/**
 * @swagger
 * /users/{id}/profile:
 *   put:
 *     summary: Actualiza la clave de la foto de perfil de un usuario por id.
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: El ID del usuario.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               profileKey:
 *                 type: string
 *                 description: La clave de la foto de perfil en el bucket de iDrive e2.
 *             required:
 *               - profileKey
 *     responses:
 *       200:
 *         description: La clave de la foto de perfil del usuario fue actualizada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Solicitud inválida.
 *       401:
 *         description: No autorizado.
 *       404:
 *         description: El usuario no fue encontrado.
 *       500:
 *         description: Error del servidor.
 */
router.put('/:id/profile', authenticateToken, updateProfileKeyController);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Remove a user by id
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The user id
 *     responses:
 *       204:
 *         description: The user was deleted
 *       404:
 *         description: The user was not found
 */
router.delete('/:id', authenticateToken, deleteUserController);

/**
 * @swagger
 * /users/verify-email:
 *   post:
 *     summary: Verify user email with a token
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: The verification token sent to the user's email
 *     responses:
 *       200:
 *         description: Email successfully verified
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Email verified successfully
 *       400:
 *         description: Invalid or expired token
 *       500:
 *         description: Some server error
 */
router.post('/verify-email', verifyEmailController);

/**
 * @swagger
 * /users/profile-image/{profileKey}:
 *   get:
 *     summary: Obtiene la URL de descarga de una imagen de perfil.
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: profileKey
 *         schema:
 *           type: string
 *         required: true
 *         description: La clave de la imagen de perfil en el bucket de iDrive e2.
 *     responses:
 *       200:
 *         description: URL de descarga de la imagen de perfil obtenida correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 downloadURL:
 *                   type: string
 *                   description: La URL firmada para descargar la imagen de perfil.
 *       400:
 *         description: Solicitud inválida o profileKey no proporcionada.
 *       401:
 *         description: No autorizado.
 *       500:
 *         description: Error del servidor.
 */
router.get('/profile-image/:profilekey', authenticateToken, getProfileImageController);
router.get('/profile-image-proxy/:profilekey', authenticateToken, serveProfileImage);

/**
 * @swagger
 * /users/{id}/profile-image-history:
 *   get:
 *     summary: Obtiene el historial de URLs de imágenes de perfil para un usuario.
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: El ID del usuario.
 *     responses:
 *       200:
 *         description: Historial de imágenes de perfil obtenido correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   profileKey:
 *                     type: string
 *                     description: La clave de la imagen de perfil.
 *                   url:
 *                     type: string
 *                     description: La URL firmada para descargar la imagen de perfil.
 *                   uploadedAt:
 *                     type: string
 *                     format: date-time
 *                     description: Fecha y hora de subida de la imagen.
 *       401:
 *         description: No autorizado.
 *       404:
 *         description: No se encontró historial de imágenes de perfil para este usuario.
 *       500:
 *         description: Error del servidor.
 */
router.get('/:id/profile-image-history', authenticateToken, getProfileImageHistoryController);

/**
 * @swagger
 * /users/{id}/profile-image-history/select:
 *   post:
 *     summary: Permite al usuario seleccionar una imagen de perfil histórica como su foto de perfil actual.
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: El ID del usuario.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               profileKey:
 *                 type: string
 *                 description: La clave de la imagen de perfil histórica a seleccionar.
 *             required:
 *               - profileKey
 *     responses:
 *       200:
 *         description: Foto de perfil actualizada correctamente desde el historial.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Foto de perfil actualizada correctamente desde el historial.
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Solicitud inválida o profileKey no proporcionada.
 *       401:
 *         description: No autorizado.
 *       404:
 *         description: Usuario no encontrado o la profileKey no se encontró en el historial.
 *       500:
 *         description: Error del servidor.
 */
router.post('/:id/profile-image-history/select', authenticateToken, selectProfileImageFromHistoryController);

export default router;
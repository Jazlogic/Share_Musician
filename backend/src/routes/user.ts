import { Router } from 'express';
import {
  createUserController,
  getUsersController,
  getUserByIdController,
  updateUserController,
  deleteUserController,
  verifyEmailController,
  updateProfileKeyController,
} from '../controllers/userController';
import { authenticateToken } from '../middleware/authMiddleware';

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

export default router;
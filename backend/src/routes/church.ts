import { Router } from 'express';
import {
  createChurchController,
  getChurchesController,
  getChurchByIdController,
  updateChurchController,
  deleteChurchController,
} from '../controllers/churchController'; 
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Churches
 *   description: API for managing churches
 */

/**
 * @swagger
 * /churches:
 *   post:
 *     summary: Create a new church
 *     tags: [Churches]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the church
 *               location:
 *                 type: string
 *                 description: The location of the church
 *     responses:
 *       201:
 *         description: The church was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Church'
 *       500:
 *         description: Some server error
 */
router.post('/', authenticateToken, createChurchController);

/**
 * @swagger
 * /churches:
 *   get:
 *     summary: Returns the list of all churches
 *     tags: [Churches]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: The list of the churches
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Church'
 */
router.get('/', authenticateToken, getChurchesController); 

/**
 * @swagger
 * /churches/{id}:
 *   get:
 *     summary: Get a church by id
 *     tags: [Churches]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The church id
 *     responses:
 *       200:
 *         description: The church description by id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Church'
 *       404:
 *         description: The church was not found
 */
router.get('/:id', authenticateToken, getChurchByIdController);

/**
 * @swagger
 * /churches/{id}:
 *   put:
 *     summary: Update a church by id
 *     tags: [Churches]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The church id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the church
 *               location:
 *                 type: string
 *                 description: The location of the church
 *     responses:
 *       200:
 *         description: The church was updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Church'
 *       404:
 *         description: The church was not found
 *       500:
 *         description: Some error happened
 */
router.put('/:id', authenticateToken, updateChurchController);

/**
 * @swagger
 * /churches/{id}:
 *   delete:
 *     summary: Remove a church by id
 *     tags: [Churches]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The church id
 *     responses:
 *       204:
 *         description: The church was deleted
 *       404:
 *         description: The church was not found
 */
router.delete('/:id', authenticateToken, deleteChurchController);

export default router;
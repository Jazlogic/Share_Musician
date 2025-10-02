import { Request, Response } from 'express';
import  pool  from '../config/db';
import { registerUser, loginUser, verifyEmail, setPassword } from '../services/authService';

export const testDbConnection = async (req: Request, res: Response) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ message: 'Conexión a la base de datos exitosa.' });
  } catch (error: any) {
    console.error('Error al conectar a la base de datos:', error.message);
    res.status(500).json({ message: 'Error al conectar a la base de datos.', error: error.message });
  }
};

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registra un nuevo usuario con correo electrónico, nombre y teléfono. La contraseña se establecerá después de la verificación del correo.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico del usuario.
 *               name:
 *                 type: string
 *                 description: Nombre del usuario.
 *               phone:
 *                 type: string
 *                 description: Número de teléfono del usuario.
 *             required:
 *               - email
 *               - name
 *               - phone
 *     responses:
 *       201 Created:
 *         description: Usuario registrado exitosamente. Se ha enviado un código de verificación al correo.
 *       400 Bad Request:
 *         description: Datos de entrada inválidos.
 *       409 Conflict:
 *         description: El correo electrónico ya está registrado.
 *       500 Internal Server Error:
 *         description: Error del servidor.
 */
export const register = async (req: Request, res: Response) => {
  const { email, name, phone } = req.body;

  try {
    const newUser = await registerUser(email, name, phone);
    res.status(201).json({ message: 'Usuario registrado exitosamente. Por favor, verifica tu correo electrónico.', userId: newUser.user_id });
  } catch (error: any) {
    if (error.message === 'Email already registered') {
      return res.status(409).json({ message: 'El correo electrónico ya está registrado' });
    }
    console.error('Error during user registration:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

/**
 * @swagger
 * /auth/set-password:
 *   post:
 *     summary: Establece la contraseña para un usuario con el correo electrónico verificado.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID del usuario.
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Nueva contraseña del usuario (mínimo 6 caracteres).
 *             required:
 *               - userId
 *               - password
 *     responses:
 *       200 OK:
 *         description: Contraseña establecida exitosamente y usuario activado.
 *       400 Bad Request:
 *         description: Datos de entrada inválidos o usuario no encontrado.
 *       500 Internal Server Error:
 *         description: Error del servidor.
 */
export const setUserPassword = async (req: Request, res: Response) => {
  const { userId, password } = req.body;

  try {
    await setPassword(userId, password);
    res.status(200).json({ message: 'Contraseña establecida exitosamente y usuario activado.' });
  } catch (error: any) {
    console.error('Error setting user password:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

/**
 * @swagger
 * /auth/verify-email:
 *   post:
 *     summary: Verifica el correo electrónico de un usuario con un código de 6 dígitos.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico del usuario.
 *               code:
 *                 type: string
 *                 description: Código de verificación de 6 dígitos.
 *             required:
 *               - email
 *               - code
 *     responses:
 *       200 OK:
 *         description: Correo electrónico verificado exitosamente.
 *       400 Bad Request:
 *         description: Datos de entrada inválidos o código de verificación incorrecto.
 *       404 Not Found:
 *         description: Usuario no encontrado.
 *       500 Internal Server Error:
 *         description: Error del servidor.
 */
export const verifyUserEmail = async (req: Request, res: Response) => {
  const { email, code } = req.body;

  try {
    await verifyEmail(email, code);
    res.status(200).json({ message: 'Correo electrónico verificado exitosamente.' });
  } catch (error: any) {
    if (error.message === 'Usuario no encontrado') {
      return res.status(404).json({ message: error.message });
    }
    if (error.message === 'Código de verificación inválido') {
      return res.status(400).json({ message: error.message });
    }
    console.error('Error during email verification:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const { user, token } = await loginUser(email, password);
    res.status(200).json({ message: 'Login exitoso', user, token });
  } catch (error: any) {
    if (error.message === 'Credenciales inválidas') {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    if (error.message === 'Correo electrónico no verificado') {
      return res.status(403).json({ message: 'Correo electrónico no verificado. Por favor, verifica tu correo antes de iniciar sesión.' });
    }
    console.error('Error en el login:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
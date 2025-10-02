import { Request, Response } from 'express';
import  pool  from '../config/db';
import { registerUser } from '../services/authService';

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
 *     summary: Registra un nuevo usuario con correo electrónico, nombre, teléfono y contraseña.
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
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Contraseña del usuario (mínimo 6 caracteres).
 *             required:
 *               - email
 *               - name
 *               - phone
 *               - password
 *     responses:
 *       201 Created:
 *         description: Usuario registrado exitosamente.
 *       400 Bad Request:
 *         description: Datos de entrada inválidos.
 *       409 Conflict:
 *         description: El correo electrónico ya está registrado.
 *       500 Internal Server Error:
 *         description: Error del servidor.
 */
export const register = async (req: Request, res: Response) => {
  const { email, name, phone, password } = req.body;

  try {
    const newUser = await registerUser(email, name, phone, password);
    res.status(201).json({ message: 'User registered successfully.', userId: newUser.user_id });
  } catch (error: any) {
    if (error.message === 'Email already registered') {
      return res.status(409).json({ message: error.message });
    }
    console.error('Error during user registration:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // Aquí irá la lógica para verificar las credenciales del usuario
    // Por ahora, solo enviaremos un mensaje de éxito si se reciben email y password
    if (email && password) {
      res.status(200).json({ message: 'Login exitoso (lógica pendiente)' });
    } else {
      res.status(400).json({ message: 'Email y contraseña son requeridos' });
    }
  } catch (error) {
    console.error('Error en el login:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
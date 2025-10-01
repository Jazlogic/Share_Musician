import { Request, Response } from 'express';
import pool from '../config/db';

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
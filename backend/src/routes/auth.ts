import { Router } from 'express';
import { login } from '../controllers/authController';
import pool from '../config/db';

const router = Router();

router.post('/login', login);

router.get('/test-db', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.status(200).json({ message: 'Conexión a la base de datos exitosa.' });
    } catch (error) {
        console.error('Error al conectar a la base de datos:', error);
        res.status(500).json({ message: 'Error al conectar a la base de datos.', error: (error as any).message });
    }
});

export default router;
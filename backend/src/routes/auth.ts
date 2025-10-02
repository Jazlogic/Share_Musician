import { Router } from 'express';
import { testDbConnection, register, login } from '../controllers/authController';

const router = Router();

router.get('/test-db', testDbConnection);
router.post('/register', register);
router.post('/login', login);

export default router;
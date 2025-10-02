import { Router } from 'express';
import { testDbConnection, register, login, verifyUserEmail } from '../controllers/authController';

const router = Router();

router.get('/test-db', testDbConnection);
router.post('/register', register);
router.post('/login', login);
router.post('/verify-email', verifyUserEmail);

export default router;
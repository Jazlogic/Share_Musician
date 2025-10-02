import { Router } from 'express';
import { testDbConnection, register, login, verifyUserEmail, setUserPassword } from '../controllers/authController';

const router = Router();

router.get('/test-db', testDbConnection);
router.post('/register', register);
router.post('/login', login);
router.post('/verify-email', verifyUserEmail);
router.post('/set-password', setUserPassword);

export default router;
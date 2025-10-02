import { Router } from 'express';
import { testDbConnection, register, login, verifyUserEmail, setUserPassword, resendVerificationEmailController } from '../controllers/authController';

const router = Router();

router.get('/test-db', testDbConnection);
router.post('/register', register);
router.post('/login', login);
router.post('/verify-email', verifyUserEmail);
router.post('/set-password', setUserPassword);
router.post('/resend-verification-email', resendVerificationEmailController);

export default router;
import { Router } from 'express';
import { testDbConnection, register, login, verifyUserEmail, setUserPassword, resendVerificationEmailController, requestPasswordResetController, resetPasswordController } from '../controllers/authController';

const router = Router();

router.get('/test-db', testDbConnection);
router.post('/register', register);
router.post('/login', login);
router.post('/verify-email', verifyUserEmail);
router.post('/set-password', setUserPassword);
router.post('/resend-verification-email', resendVerificationEmailController);
router.post('/request-password-reset', requestPasswordResetController);
router.post('/reset-password', resetPasswordController);

export default router;
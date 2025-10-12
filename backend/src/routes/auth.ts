import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { testDbConnection, register, login, verifyUserEmail, setUserPassword, resendVerificationEmailController, requestPasswordResetController, resetPasswordController, verifyResetCodeController } from '../controllers/authController';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

router.get('/test-db', authLimiter, testDbConnection);
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/verify-email', authLimiter, verifyUserEmail);
router.post('/set-password', authLimiter, setUserPassword);
router.post('/resend-verification-email', authLimiter, resendVerificationEmailController);
router.post('/request-password-reset', authLimiter, requestPasswordResetController);
router.post('/reset-password', authLimiter, resetPasswordController);
router.post('/verify-reset-code', authLimiter, verifyResetCodeController);

export default router;
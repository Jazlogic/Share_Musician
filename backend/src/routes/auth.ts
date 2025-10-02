import { Router } from 'express';
import { testDbConnection, register } from '../controllers/authController';

const router = Router();

router.get('/test-db', testDbConnection);
router.post('/register', register);

export default router;
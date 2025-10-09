import { Router } from 'express';
import { getRequestStatuses } from '../controllers/requestStatusController';

const router = Router();

router.get('/', getRequestStatuses);

export default router;
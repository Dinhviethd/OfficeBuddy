import { Router } from 'express';
import authRoute from './apis/auth.route';
import aiRoute from './apis/ai.route';

const router = Router();

router.use('/auth', authRoute);
router.use('/ai', aiRoute);
export default router;

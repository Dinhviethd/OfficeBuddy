import { Router } from 'express';
import authRoute from './apis/auth.route';
import aiRoute from './apis/ai.route';
import adminRoute from './apis/admin.route';

const router = Router();

router.use('/auth', authRoute);
router.use('/ai', aiRoute);
router.use('/admin', adminRoute);
export default router;

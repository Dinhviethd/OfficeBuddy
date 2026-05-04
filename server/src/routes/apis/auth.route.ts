import { Router } from 'express';
import { authController } from '@/modules/auth/controllers/auth.controller';
import { authMiddleware } from '@/modules/auth/middleware/auth.middleware';
const router = Router();
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);
router.get('/me', authMiddleware, authController.getCurrentUser);
router.put('/me', authMiddleware, authController.updateCurrentProfile);
router.post('/logout', authMiddleware, authController.logout);

export default router;

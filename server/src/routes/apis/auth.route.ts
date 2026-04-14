import { Router } from 'express';
import { authController } from '@/modules/auth/controllers/auth.controller';
import { authMiddleware } from '@/modules/auth/middleware/auth.middleware';
import { uploadAvatar } from '@/utils/upload';

const router = Router();
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/send-otp', authController.sendOTP);
router.post('/verify-otp', authController.verifyOTP);
router.post('/reset-password', authController.resetPassword);
router.get('/me', authMiddleware, authController.getCurrentUser);
router.get('/avatar', authMiddleware, authController.getCurrentAvatar);
router.put('/me', authMiddleware, authController.updateCurrentProfile);
router.put('/change-password', authMiddleware, authController.changePassword);
router.put('/avatar/preset', authMiddleware, authController.updatePresetAvatar);
router.post('/avatar', authMiddleware, uploadAvatar.single('avatar'), authController.uploadAvatar);
router.post('/logout', authMiddleware, authController.logout);

export default router;

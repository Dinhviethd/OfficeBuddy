import { Router } from 'express';
import { levelConfigController } from '@/modules/gamification/controllers/level-config.controller';
import { userStatController } from '@/modules/gamification/controllers/user-stat.controller';
import { xpTransactionController } from '@/modules/gamification/controllers/xp-transaction.controller';

const router = Router();

router.get('/levels', levelConfigController.getAll);
router.get('/levels/:id', levelConfigController.getById);
router.post('/levels', levelConfigController.create);
router.put('/levels/:id', levelConfigController.update);
router.delete('/levels/:id', levelConfigController.delete);

router.get('/stats', userStatController.getAll);
router.get('/stats/:id', userStatController.getById);
router.get('/stats/user/:userId', userStatController.getByUser);
router.post('/stats', userStatController.create);
router.put('/stats/:id', userStatController.update);
router.delete('/stats/:id', userStatController.delete);

router.get('/xp/:id', xpTransactionController.getById);
router.get('/xp/user/:userId', xpTransactionController.getByUser);
router.post('/xp', xpTransactionController.create);
router.put('/xp/:id', xpTransactionController.update);
router.delete('/xp/:id', xpTransactionController.delete);

export default router;

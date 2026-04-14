import { Router } from 'express';
import authRoute from './apis/auth.route';
import lessonRoute from './apis/lesson.route';
import gamificationRoute from './apis/gamification.route';
import quizRoute from './apis/quiz.route';

const router = Router();

router.use('/auth', authRoute);
router.use('/lesson', lessonRoute);
router.use('/gamification', gamificationRoute);
router.use('/quiz', quizRoute);
export default router;

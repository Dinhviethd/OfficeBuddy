import { Router } from 'express';
import { quizController } from '@/modules/quiz/controllers/quiz.controller';
import { questionController } from '@/modules/quiz/controllers/question.controller';
import { answerController } from '@/modules/quiz/controllers/answer.controller';
import { quizAttemptController } from '@/modules/quiz/controllers/quiz-attempt.controller';

const router = Router();

router.get('/', quizController.getAll);
router.get('/paginated', quizController.getAllPaginated);
router.get('/stats', quizAttemptController.getTotalQuizzes);
router.get('/with-stats', quizController.getAllWithQuestionCount);
router.get('/:id', quizController.getById);
router.post('/', quizController.create);
router.put('/:id', quizController.update);
router.delete('/:id', quizController.delete);

router.get('/questions/:id', questionController.getById);
router.get('/:quizId/questions', questionController.getByQuiz);
router.post('/questions', questionController.create);
router.put('/questions/:id', questionController.update);
router.delete('/questions/:id', questionController.delete);

router.get('/answers/:id', answerController.getById);
router.get('/questions/:questionId/answers', answerController.getByQuestion);
router.post('/answers', answerController.create);
router.put('/answers/:id', answerController.update);
router.delete('/answers/:id', answerController.delete);

router.get('/attempts/stats/user/:userId', quizAttemptController.getStatsByUser);
router.get('/attempts/user/:userId', quizAttemptController.getByUser);
router.get('/attempts/:id', quizAttemptController.getById);
router.post('/attempts', quizAttemptController.create);
router.put('/attempts/:id', quizAttemptController.update);
router.delete('/attempts/:id', quizAttemptController.delete);

export default router;

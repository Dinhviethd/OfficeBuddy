import { Router } from 'express';
import { chapterController } from '@/modules/lesson/controllers/chapter.controller';
import { lessonController } from '@/modules/lesson/controllers/lesson.controller';
import { lessonMediaController } from '@/modules/lesson/controllers/lesson-media.controller';
import { userLessonProgressController } from '@/modules/lesson/controllers/user-lesson-progress.controller';
import { userNoteController } from '@/modules/lesson/controllers/user-note.controller';

const router = Router();

router.get('/chapters', chapterController.getAll);
router.get('/chapters/:id', chapterController.getById);
router.post('/chapters', chapterController.create);
router.put('/chapters/:id', chapterController.update);
router.delete('/chapters/:id', chapterController.delete);

router.get('/lessons', lessonController.getAll);
router.get('/lessons/:id', lessonController.getById);
router.get('/chapters/:chapterId/lessons', lessonController.getByChapter);
router.post('/lessons', lessonController.create);
router.put('/lessons/:id', lessonController.update);
router.delete('/lessons/:id', lessonController.delete);

router.get('/media/:id', lessonMediaController.getById);
router.get('/lessons/:lessonId/media', lessonMediaController.getByLesson);
router.post('/media', lessonMediaController.create);
router.put('/media/:id', lessonMediaController.update);
router.delete('/media/:id', lessonMediaController.delete);

router.get('/progress/:id', userLessonProgressController.getById);
router.get('/progress/user/:userId', userLessonProgressController.getByUser);
router.get('/progress/user/:userId/lesson/:lessonId', userLessonProgressController.getByUserAndLesson);
router.post('/progress', userLessonProgressController.create);
router.put('/progress/:id', userLessonProgressController.update);
router.delete('/progress/:id', userLessonProgressController.delete);

router.get('/notes/:id', userNoteController.getById);
router.get('/notes/user/:userId', userNoteController.getByUser);
router.get('/notes/lesson/:lessonId', userNoteController.getByLesson);
router.post('/notes', userNoteController.create);
router.put('/notes/:id', userNoteController.update);
router.delete('/notes/:id', userNoteController.delete);

export default router;

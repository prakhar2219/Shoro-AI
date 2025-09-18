import { Router } from 'express';
import {
  bulkCreateChapters,
  createChapter,
  getChapters,
  getChapter,
  getChapterBySlug,
  updateChapter,
  deleteChapter,
  addChapterTranslation,
  updateChapterTranslation,
  deleteChapterTranslation,
} from '../../controllers/content/chapter.controller';

const router = Router();

router.post('/', createChapter);
// Bulk operations
router.post('/bulk', bulkCreateChapters);
router.get('/', getChapters);
router.get('/by-slug', getChapterBySlug);
router.get('/:id', getChapter);
router.put('/:id', updateChapter);
router.delete('/:id', deleteChapter);
router.post('/:id/translations', addChapterTranslation);
router.put('/:id/translations/:translationId', updateChapterTranslation);
router.delete('/:id/translations/:translationId', deleteChapterTranslation);

export default router;

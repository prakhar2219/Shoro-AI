// routes/class.routes.ts
import { Router } from 'express';
import {
  createClass,
  bulkCreateClasses,
  getClasses,
  getClass,
  updateClass,
  deleteClass,
  getClassesWithPagination,
  getClassTranslations,
  createClassTranslation,
  updateClassTranslation,
  deleteClassTranslation,
  getClassesByBoard,
} from '../../controllers/content/class.controller';

const router = Router();

// Paginated and search endpoints (should come before /:id routes)
router.get('/paginated', getClassesWithPagination);
router.get('/by-board/:board_id', getClassesByBoard);

// Class translation endpoints
router.get('/:id/translations', getClassTranslations);
router.post('/:id/translations', createClassTranslation);
router.put('/:id/translations/:translationId', updateClassTranslation);
router.delete('/:id/translations/:translationId', deleteClassTranslation);

router.post('/', createClass);
router.post('/bulk', bulkCreateClasses);
router.get('/', getClasses);
router.get('/:id', getClass);
router.put('/:id', updateClass);
router.delete('/:id', deleteClass);

export default router;

// routes/class.routes.ts
import { Router } from 'express';
import {
  createClass,
  getClasses,
  getClass,
  updateClass,
  deleteClass,
  getClassesWithPagination,
  getClassTranslations,
  createClassTranslation,
  updateClassTranslation,
  deleteClassTranslation,
} from '../../controllers/content/class.controller';

const router = Router();

// Paginated and search endpoints (should come before /:id routes)
router.get('/paginated', getClassesWithPagination);

// Class translation endpoints
router.get('/:id/translations', getClassTranslations);
router.post('/:id/translations', createClassTranslation);
router.put('/:id/translations/:translationId', updateClassTranslation);
router.delete('/:id/translations/:translationId', deleteClassTranslation);

router.post('/', createClass);
router.get('/', getClasses);
router.get('/:id', getClass);
router.put('/:id', updateClass);
router.delete('/:id', deleteClass);

export default router;

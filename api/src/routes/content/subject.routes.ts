// routes/subject.routes.ts
import { Router } from 'express';
import {
  bulkCreateSubjects,
  createSubject,
  getSubjects,
  getSubject,
  updateSubject,
  deleteSubject,
  getSubjectsWithPagination,
  getSubjectTranslations,
  createSubjectTranslation,
  updateSubjectTranslation,
  deleteSubjectTranslation,
} from '../../controllers/content/subject.controller';

const router = Router();

// Paginated and search endpoints (should come before /:id routes)
router.get('/paginated', getSubjectsWithPagination);

// Bulk operations
router.post('/bulk', bulkCreateSubjects);

// Subject translation endpoints
router.get('/:id/translations', getSubjectTranslations);
router.post('/:id/translations', createSubjectTranslation);
router.put('/:id/translations/:translationId', updateSubjectTranslation);
router.delete('/:id/translations/:translationId', deleteSubjectTranslation);

router.post('/', createSubject);
router.get('/', getSubjects);
router.get('/:id', getSubject);
router.put('/:id', updateSubject);
router.delete('/:id', deleteSubject);

export default router;

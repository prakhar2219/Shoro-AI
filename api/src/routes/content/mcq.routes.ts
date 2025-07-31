import { Router } from 'express';
import {
  createMCQ,
  getMCQs,
  getMCQ,
  updateMCQ,
  deleteMCQ,
  getMCQsWithPagination,
  // MCQ translation controllers
  createMCQTranslation,
  updateMCQTranslation,
  deleteMCQTranslation,
  getMCQTranslations,
} from '../../controllers/content/mcq.controller';

const router = Router();

// MCQ endpoints
router.get('/paginated', getMCQsWithPagination);
router.get('/', getMCQs);
router.post('/', createMCQ);
router.get('/:id', getMCQ);
router.put('/:id', updateMCQ);
router.delete('/:id', deleteMCQ);

// MCQ translation endpoints
router.get('/:mcqId/translations', getMCQTranslations);
router.post('/:mcqId/translations', createMCQTranslation);
router.put('/:mcqId/translations/:translationId', updateMCQTranslation);
router.delete('/:mcqId/translations/:translationId', deleteMCQTranslation);

export default router; 
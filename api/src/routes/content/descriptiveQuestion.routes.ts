import { Router } from 'express';
import {
  bulkCreateDescriptiveQuestions,
  createDescriptiveQuestion,
  getDescriptiveQuestions,
  getDescriptiveQuestion,
  updateDescriptiveQuestion,
  deleteDescriptiveQuestion,
  getDescriptiveQuestionsWithPagination,
  // Descriptive question translation controllers
  createDescriptiveQuestionTranslation,
  updateDescriptiveQuestionTranslation,
  deleteDescriptiveQuestionTranslation,
  getDescriptiveQuestionTranslations,
} from '../../controllers/content/descriptiveQuestion.controller';

const router = Router();

// Descriptive Question endpoints
router.get('/paginated', getDescriptiveQuestionsWithPagination);
// Bulk operations
router.post('/bulk', bulkCreateDescriptiveQuestions);
router.get('/', getDescriptiveQuestions);
router.post('/', createDescriptiveQuestion);
router.get('/:id', getDescriptiveQuestion);
router.put('/:id', updateDescriptiveQuestion);
router.delete('/:id', deleteDescriptiveQuestion);

// Descriptive Question translation endpoints
router.get('/:questionId/translations', getDescriptiveQuestionTranslations);
router.post('/:questionId/translations', createDescriptiveQuestionTranslation);
router.put('/:questionId/translations/:translationId', updateDescriptiveQuestionTranslation);
router.delete('/:questionId/translations/:translationId', deleteDescriptiveQuestionTranslation);

export default router; 
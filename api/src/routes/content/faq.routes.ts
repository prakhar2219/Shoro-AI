import { Router } from 'express';
import {
  bulkCreateFAQs,
  createFAQ,
  getFAQs,
  getFAQ,
  updateFAQ,
  deleteFAQ,
  getFAQsWithPagination,
  // FAQ translation controllers
  createFAQTranslation,
  updateFAQTranslation,
  deleteFAQTranslation,
  getFAQTranslations,
} from '../../controllers/content/faq.controller';

const router = Router();

// FAQ endpoints
router.get('/paginated', getFAQsWithPagination);
// Bulk operations
router.post('/bulk', bulkCreateFAQs);
router.get('/', getFAQs);
router.post('/', createFAQ);
router.get('/:id', getFAQ);
router.put('/:id', updateFAQ);
router.delete('/:id', deleteFAQ);

// FAQ translation endpoints
router.get('/:faqId/translations', getFAQTranslations);
router.post('/:faqId/translations', createFAQTranslation);
router.put('/:faqId/translations/:translationId', updateFAQTranslation);
router.delete('/:faqId/translations/:translationId', deleteFAQTranslation);

export default router; 
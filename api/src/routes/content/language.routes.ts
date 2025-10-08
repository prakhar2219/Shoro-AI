import { Router } from 'express';
import {
  createLanguage,
  getLanguages,
  getLanguage,
  updateLanguage,
  deleteLanguage,
  searchLanguages,
  getLanguagesWithPagination,
  getAISupportedLanguages,
  getLanguagesByDirection,
  bulkCreateLanguages,
  getLanguageStats,
} from '../../controllers/content/language.controller';

const router = Router();

// Search and filtering endpoints (must come before /:code routes)
router.get('/search', searchLanguages);
router.get('/paginated', getLanguagesWithPagination);
router.get('/ai-supported', getAISupportedLanguages);
router.get('/direction/:direction', getLanguagesByDirection);
router.get('/stats', getLanguageStats);

// Basic CRUD operations
router.post('/', createLanguage);
router.get('/', getLanguages);
router.get('/:code', getLanguage);
router.put('/:code', updateLanguage);
router.delete('/:code', deleteLanguage);

// Bulk operations
router.post('/bulk', bulkCreateLanguages);

export default router;

import { Router } from 'express';
import {
  createCountry,
  getCountries,
  getCountry,
  updateCountry,
  deleteCountry,
  getCountriesWithPagination,
  searchCountries,
  bulkCreateCountries,
  getCountryStats,
  // Country translation controllers
  createCountryTranslation,
  updateCountryTranslation,
  deleteCountryTranslation,
  getCountryTranslations,
  getCountryTranslation,
} from '../../controllers/content/country.controller';

const router = Router();

// Search and filtering endpoints (must come before /:code routes)
router.get('/search', searchCountries);
router.get('/paginated', getCountriesWithPagination);
router.get('/stats', getCountryStats);

// Bulk operations
router.post('/bulk', bulkCreateCountries);

// Basic CRUD operations
router.post('/', createCountry);
router.get('/', getCountries);
router.get('/:code', getCountry);
router.put('/:code', updateCountry);
router.delete('/:code', deleteCountry);

// Country translation endpoints
router.get('/:code/translations', getCountryTranslations);
router.post('/:code/translations', createCountryTranslation);
router.get('/:code/translations/:translationId', getCountryTranslation);
router.put('/:code/translations/:translationId', updateCountryTranslation);
router.delete('/:code/translations/:translationId', deleteCountryTranslation);

export default router;

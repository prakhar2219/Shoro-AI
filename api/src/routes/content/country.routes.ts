import { Router } from 'express';
import {
  createCountry,
  getCountries,
  getCountry,
  updateCountry,
  deleteCountry,
} from '../../controllers/content/country.controller';

const router = Router();

router.post('/', createCountry);
router.get('/', getCountries);
router.get('/:code', getCountry);
router.put('/:code', updateCountry);
router.delete('/:code', deleteCountry);

export default router;

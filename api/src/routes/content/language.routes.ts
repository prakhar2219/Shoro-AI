import { Router } from 'express';
import {
  createLanguage,
  getLanguages,
  getLanguage,
  updateLanguage,
  deleteLanguage,
} from '../../controllers/content/language.controller';

const router = Router();

router.post('/', createLanguage);
router.get('/', getLanguages);
router.get('/:code', getLanguage);
router.put('/:code', updateLanguage);
router.delete('/:code', deleteLanguage);

export default router;

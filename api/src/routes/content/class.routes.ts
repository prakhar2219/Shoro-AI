// routes/class.routes.ts
import { Router } from 'express';
import {
  createClass,
  getClasses,
  getClass,
  updateClass,
  deleteClass,
} from '../../controllers/content/class.controller';

const router = Router();

router.post('/', createClass);
router.get('/', getClasses);
router.get('/:id', getClass);
router.put('/:id', updateClass);
router.delete('/:id', deleteClass);

export default router;

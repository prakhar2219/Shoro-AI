import { Router } from 'express';
import {
  createSubtopic,
  bulkCreateSubtopics,
  getSubtopics,
  getSubtopicsWithPagination,
  getSubtopic,
  updateSubtopic,
  deleteSubtopic,
} from '../../controllers/content/subtopic.controller';

const router = Router();

router.post('/', createSubtopic);
router.post('/bulk', bulkCreateSubtopics);
router.get('/', getSubtopics);
router.get('/paginated', getSubtopicsWithPagination);
router.get('/:id', getSubtopic);
router.put('/:id', updateSubtopic);
router.delete('/:id', deleteSubtopic);

export default router;



import { Router } from 'express';
import {
  createTopic,
  bulkCreateTopics,
  getTopics,
  getTopicsWithPagination,
  getTopic,
  updateTopic,
  deleteTopic,
} from '../../controllers/content/topic.controller';

const router = Router();

router.post('/', createTopic);
router.post('/bulk', bulkCreateTopics);
router.get('/', getTopics);
router.get('/paginated', getTopicsWithPagination);
router.get('/:id', getTopic);
router.put('/:id', updateTopic);
router.delete('/:id', deleteTopic);

export default router;



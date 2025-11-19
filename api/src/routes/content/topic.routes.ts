import { Router } from 'express';
import {
  createTopic,
  bulkCreateTopics,
  getTopics,
  getTopicsWithPagination,
  getTopic,
  updateTopic,
  deleteTopic,
  createTopicTranslation,
  updateTopicTranslation,
  deleteTopicTranslation,
  getTopicTranslations,
  getTopicWithTranslations,
  getTopicsIntegrity,
} from '../../controllers/content/topic.controller';

const router = Router();

router.post('/', createTopic);
router.post('/bulk', bulkCreateTopics);
router.get('/', getTopics);
router.get('/paginated', getTopicsWithPagination);
router.get('/integrity', getTopicsIntegrity);
router.get('/:id', getTopic);
router.get('/:id/with-translations', getTopicWithTranslations);
router.put('/:id', updateTopic);
router.delete('/:id', deleteTopic);

// Translation routes
router.post('/translations', createTopicTranslation);
router.get('/:topic_id/translations', getTopicTranslations);
router.put('/:topic_id/translations/:language_id', updateTopicTranslation);
router.delete('/:topic_id/translations/:language_id', deleteTopicTranslation);

export default router;



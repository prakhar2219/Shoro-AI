import { Router } from 'express';
import * as gbTopicController from '../../controllers/content/gbTopic.controller';

const router = Router();

// GB Topic routes
router.post('/', gbTopicController.createGBTopic);
router.post('/bulk', gbTopicController.bulkCreateGBTopics);
router.get('/', gbTopicController.getGBTopics);
router.get('/:id', gbTopicController.getGBTopic);
router.put('/:id', gbTopicController.updateGBTopic);
router.delete('/:id', gbTopicController.deleteGBTopic);

export default router;

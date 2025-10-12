import { Router } from 'express';
import * as gbSubtopicController from '../../controllers/content/gbSubtopic.controller';

const router = Router();

// GB Subtopic routes
router.post('/', gbSubtopicController.createGBSubtopic);
router.post('/bulk', gbSubtopicController.bulkCreateGBSubtopics);
router.get('/', gbSubtopicController.getGBSubtopics);
router.get('/:id', gbSubtopicController.getGBSubtopic);
router.put('/:id', gbSubtopicController.updateGBSubtopic);
router.delete('/:id', gbSubtopicController.deleteGBSubtopic);

export default router;

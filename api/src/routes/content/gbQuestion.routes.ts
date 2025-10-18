import { Router } from 'express';
import * as gbQuestionController from '../../controllers/content/gbQuestion.controller';

const router = Router();

// GB Question routes
router.post('/', gbQuestionController.createGBQuestion);
router.post('/bulk', gbQuestionController.bulkCreateGBQuestions);
router.get('/', gbQuestionController.getGBQuestions);
router.get('/:id', gbQuestionController.getGBQuestion);
router.put('/:id', gbQuestionController.updateGBQuestion);
router.delete('/:id', gbQuestionController.deleteGBQuestion);

export default router;

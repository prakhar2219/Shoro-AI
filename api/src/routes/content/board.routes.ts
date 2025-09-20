import { Router } from 'express';
import boardController from '../../controllers/content/board.controller';

const router = Router();

router.post('/', boardController.createBoard);
router.post('/bulk', boardController.bulkCreateBoards);
router.get('/', boardController.getBoards);
router.get('/paginated', boardController.getBoardsWithPagination);

// Board translation endpoints
router.get('/:short_code/translations', boardController.getBoardTranslations);
router.post('/:short_code/translations', boardController.createBoardTranslation);
router.put('/:short_code/translations/:translationId', boardController.updateBoardTranslation);
router.delete('/:short_code/translations/:translationId', boardController.deleteBoardTranslation);

router.get('/:short_code', boardController.getBoard);
router.put('/:short_code', boardController.updateBoard);
router.delete('/:short_code', boardController.deleteBoard);

export default router;

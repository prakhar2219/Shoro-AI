import { Router } from 'express';
import {
    createBoard,
    getBoards,
    getBoard,
    updateBoard,
    deleteBoard,
} from '../../controllers/content/board.controller';

const router = Router();

router.post('/', createBoard);
router.get('/', getBoards);
router.get('/:short_code', getBoard);
router.put('/:short_code', updateBoard);
router.delete('/:short_code', deleteBoard);

export default router;

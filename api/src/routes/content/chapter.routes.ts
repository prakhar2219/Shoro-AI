import { Router } from 'express';
import {
    createChapter,
    getChapters,
    getChapter,
    updateChapter,
    deleteChapter,
} from '../../controllers/content/chapter.controller';

const router = Router();

router.post('/', createChapter);
router.get('/', getChapters);
router.get('/:id', getChapter);
router.put('/:id', updateChapter);
router.delete('/:id', deleteChapter);

export default router;
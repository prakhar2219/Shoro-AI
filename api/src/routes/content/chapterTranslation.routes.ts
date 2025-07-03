import { Router } from 'express';

import {
    createChapterTranslation,
    getChapterTranslations,
    getChapterTranslation,
    updateChapterTranslation,
    deleteChapterTranslation,
} from '../../controllers/content/chapterTranslation.controller';

const router = Router();


// Chapter translation routes
router.post('/translations', createChapterTranslation);
router.get('/translations', getChapterTranslations);
router.get('/translations/:slug', getChapterTranslation);
router.put('/translations/:slug', updateChapterTranslation);
router.delete('/translations/:slug', deleteChapterTranslation);

export default router;

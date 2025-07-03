// routes/subject.routes.ts
import { Router } from 'express';
import {
    createSubject,
    getSubjects,
    getSubject,
    updateSubject,
    deleteSubject,
} from '../../controllers/content/subject.controller';

const router = Router();

router.post('/', createSubject);
router.get('/', getSubjects);
router.get('/:id', getSubject);
router.put('/:id', updateSubject);
router.delete('/:id', deleteSubject);

export default router;
import { Router } from 'express';
import languageRoutes from './language.routes';
import countryRoutes from './country.routes';
import boardRoutes from './board.routes';
import classRoutes from './class.routes';
import subjectRoutes from './subject.routes';
import chapterRoutes from './chapter.routes';
import mcqRoutes from './mcq.routes';
import descriptiveQuestionRoutes from './descriptiveQuestion.routes';
import faqRoutes from './faq.routes';

const router = Router();

router.use('/languages', languageRoutes);
router.use('/countries', countryRoutes);
router.use('/boards', boardRoutes);
router.use('/classes', classRoutes);
router.use('/subjects', subjectRoutes);
router.use('/chapters', chapterRoutes);
router.use('/mcqs', mcqRoutes);
router.use('/descriptive-questions', descriptiveQuestionRoutes);
router.use('/faqs', faqRoutes);

export default router;

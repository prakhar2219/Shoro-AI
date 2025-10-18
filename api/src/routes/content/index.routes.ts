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
import topicRoutes from './topic.routes';
import subtopicRoutes from './subtopic.routes';
import gbCategoryRoutes from './gbCategory.routes';
import gbTopicRoutes from './gbTopic.routes';
import gbSubtopicRoutes from './gbSubtopic.routes';
import gbQuestionRoutes from './gbQuestion.routes';

const router = Router();

router.use('/languages', languageRoutes);
router.use('/countries', countryRoutes);
router.use('/boards', boardRoutes);
router.use('/classes', classRoutes);
router.use('/subjects', subjectRoutes);
router.use('/chapters', chapterRoutes);
router.use('/topics', topicRoutes);
router.use('/subtopics', subtopicRoutes);
router.use('/mcqs', mcqRoutes);
router.use('/descriptive-questions', descriptiveQuestionRoutes);
router.use('/faqs', faqRoutes);
router.use('/gb-categories', gbCategoryRoutes);
router.use('/gb-topics', gbTopicRoutes);
router.use('/gb-subtopics', gbSubtopicRoutes);
router.use('/gb-questions', gbQuestionRoutes);

export default router;

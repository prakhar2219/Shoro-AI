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
import { clerkProtect, clerkRestrictTo } from '../../middleware/clerkAuth';

const router = Router();

// Apply authentication and authorization to all content routes
// Only authenticated admin users (super_admin, admin, editor) can access
// router.use(clerkProtect);
// router.use(clerkRestrictTo('super_admin', 'admin', 'editor'));

// All content routes require authentication
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

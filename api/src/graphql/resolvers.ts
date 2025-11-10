
import axios from 'axios';
import * as languageService from "../services/content/language.service"
import * as countryService from '../services/content/country.service';
import * as boardService from '../services/content/board.service';
import * as classService from '../services/content/class.service';
import * as subjectService from '../services/content/subject.service';
import * as chapterService from '../services/content/chapter.service';
import * as topicService from '../services/content/topic.service';
import * as subtopicService from '../services/content/subtopic.service';
import * as mcqService from '../services/content/mcq.service';
import * as faqService from '../services/content/faq.service';
import * as descriptiveQuestionService from '../services/content/descriptiveQuestion.service';
import * as gbCategoryService from '../services/content/gbCategory.service';
import * as gbTopicService from '../services/content/gbTopic.service';
import * as gbSubtopicService from '../services/content/gbSubtopic.service';
import * as gbQuestionService from '../services/content/gbQuestion.service';


// Helper function to normalize ObjectId references to strings and add default values for required fields
const normalizeObjectIds = (data: any): any => {
  if (Array.isArray(data)) {
    return data.map(normalizeObjectIds);
  }

  if (data && typeof data === 'object') {
    const normalized: any = {};
    for (const key in data) {
      const value = data[key];

      // If it's a reference field (ends with _id) and is an object, extract _id
      if (key.endsWith('_id') && value && typeof value === 'object' && value._id) {
        normalized[key] = value._id;
      } else if (key.endsWith('_ids') && Array.isArray(value)) {
        // Handle array of references
        normalized[key] = value.map(v => (v && typeof v === 'object' && v._id) ? v._id : v);
      } else {
        normalized[key] = value;
      }
    }

    // Add default values for required fields if missing (to match GraphQL schema requirements)
    // supported_language_ids should always be an array (even if empty)
    if (!normalized.hasOwnProperty('supported_language_ids') || !Array.isArray(normalized.supported_language_ids)) {
      normalized.supported_language_ids = [];
    }

    // tag arrays should always be arrays (even if empty) for entities that have them
    // Only set if tag property exists (to avoid adding it to entities that don't have it)
    if (normalized.hasOwnProperty('tag') && !Array.isArray(normalized.tag)) {
      normalized.tag = [];
    }

    // version should default to 1 for chapters if missing
    if (normalized.version === undefined || normalized.version === null) {
      // Only set default for chapters (has board_id, class_id, subject_id pattern)
      if (normalized.board_id && normalized.class_id && normalized.subject_id) {
        normalized.version = 1;
      }
    }

    return normalized;
  }

  return data;
};

function wrapResolvers(resolvers) {
  const wrapped = {};
  for (const type in resolvers) {
    wrapped[type] = {};
    for (const key in resolvers[type]) {
      const originalResolver = resolvers[type][key];
      wrapped[type][key] = async (...args) => {
        const result = await originalResolver(...args);
        return normalizeObjectIds(result);
      };
    }
  }
  return wrapped;
}


export const resolvers = wrapResolvers({
  Query: {
    // ============================================
    // LANGUAGE RESOLVERS
    // ============================================
    languages: async () => {
      return await languageService.getAllLanguages();
    },

    language: async (_: any, { code }: { code: string }) => {
      return await languageService.getLanguageByCode(code);
    },

    // ============================================
    // COUNTRY RESOLVERS
    // ============================================
    countries: async () => {
      return await countryService.getAllCountries();
    },

    getCountry: async (_: any, { code }: { code: string }) => {
      return await countryService.getCountryByCode(code);
    },

    country: async (_: any, { code }: { code: string }) => {
      return await countryService.getCountryByCode(
        code
      );
    },

    // ============================================
    // BOARD RESOLVERS
    // ============================================
    boards: async () => {
      return await boardService.getAllBoards();
    },

    getBoard: async (_: any, { short_code }: { short_code: string }) => {
      return await boardService.getBoardByCode(
        short_code
      );
    },

    board: async (_: any, { short_code }: { short_code: string }) => {
      return await boardService.getBoardByCode(
        short_code
      );
    },

    boardsByCountry: async (_: any, { country_code }: { country_code: string }) => {
      return await boardService.getBoardsByCountry(country_code);
    },

    // ============================================
    // CLASS RESOLVERS
    // ============================================
    classes: async () => {
      return await classService.getAllClasses();
    },

    class: async (_: any, { id }: { id: string }) => {
      return await classService.getClassById(
        id
      );
    },

    classesByBoard: async (_: any, { board_short_code }: { board_short_code: string }) => {
      return await classService.getClassesByBoardShortCode(board_short_code);
    },

    getClassByBoardAndGrade: async (_: any, { board_short_code, grade }: { board_short_code: string; grade: number }) => {
      const classes = await classService.getClassesByBoardShortCode(board_short_code);
      return (classes as unknown as any[]).find((c: any) => c.grade === grade) || null;
    },

    // ============================================
    // SUBJECT RESOLVERS
    // ============================================
    subjects: async () => {
      return await subjectService.getAllSubjects()
    },

    subject: async (_: any, { id }: { id: string }) => {
      return await subjectService.getSubjectById(
        id
      );
    },

    subjectsByBoardAndClass: async (_: any, { board_short_code, grade }: { board_short_code: string; grade: number }) => {
      return await subjectService.getSubjectsByBoardAndClass(board_short_code, grade);
    },

    subjectByBoardAndClassAndSubject: async (_: any, args: { board_short_code: string; class_grade: number; subject_code: string }) => {
      const { board_short_code, class_grade, subject_code } = args;
      const subjects = await subjectService.getSubjectsByBoardAndClass(board_short_code, class_grade);
      return (subjects as unknown as any[]).find((s: any) => s.code === subject_code) || null;
    },

    // ============================================
    // CHAPTER RESOLVERS
    // ============================================
    chapters: async () => {
      return await chapterService.getAllChapters()
    },

    // chapter: async (_: any, { slug }: { slug: string }) => {
    //   const decodedSlug = decodeURIComponent(slug);
    //   return await apiClient.get(`/content/chapters/by-slug?slug=${encodeURIComponent(decodedSlug)}`);
    // },

    getChapterBySlug: async (_: any, args: { board_short_code: string; class_grade: number; subject_code: string; chapter_slug: string }) => {
      const { board_short_code, class_grade, subject_code, chapter_slug } = args;
      // Decode URL-encoded slugs (e.g., for non-English characters)
      const decodedSlug = decodeURIComponent(chapter_slug);
      // Normalize hyphens to spaces to support hyphenated URLs
      const normalizedSlug = decodedSlug.replace(/-/g, ' ');
      // try {
      const chapters = await chapterService.getChapterBySlug(
        board_short_code as string,
        class_grade as number,
        subject_code as string,
        chapter_slug as string,
      )
      return (chapters as unknown as any[]).find((c: any) => c.slug === decodedSlug || c.slug === normalizedSlug) || null;
      // } catch (error) {
      //   // Try both decoded and normalized variants
      //   const byExact = await apiClient.get(`/content/chapters/by-slug?slug=${encodeURIComponent(decodedSlug)}`).catch(() => null);
      //   if (byExact) return byExact;
      //   return await apiClient.get(`/content/chapters/by-slug?slug=${encodeURIComponent(normalizedSlug)}`);
      // }
    },

    getChaptersByBoardClassAndSubject: async (_: any, args: { board_short_code: string; class_grade: number; subject_code: string }) => {
      const { board_short_code, class_grade, subject_code } = args;
      return await chapterService.getChaptersByBoardClassAndSubject(
        board_short_code as string,
        class_grade as number,
        subject_code as string
      );
    },

    // ============================================
    // TOPIC RESOLVERS (Now available in Education-AI)
    // ============================================
    topics: async () => {
      return await topicService.getTopics();
    },

    // topic: async (_: any, { slug }: { slug: string }) => {
    //   try {
    //     const decodedSlug = decodeURIComponent(slug);
    //     return await apiClient.get(`/content/topics/by-slug?slug=${encodeURIComponent(decodedSlug)}`);
    //   } catch (error) {
    //     console.warn('Topic endpoint not available yet');
    //     return null;
    //   }
    // },

    // getTopicByBoardClassSubjectChapterAndTopic: async (_: any, args: any) => {
    //   const { board_short_code, class_grade, subject_code, chapter_slug, topic_slug } = args;
    //   // Decode URL-encoded slugs
    //   const decodedChapterSlug = decodeURIComponent(chapter_slug);
    //   const decodedTopicSlug = decodeURIComponent(topic_slug);
    //   const normalizedChapter = decodedChapterSlug.replace(/-/g, ' ');
    //   const normalizedTopic = decodedTopicSlug.replace(/-/g, ' ');
    //   const topics = await apiClient.get(`/content/topics?board_short_code=${board_short_code}&class_grade=${class_grade}&subject_code=${subject_code}&chapter_slug=${encodeURIComponent(normalizedChapter)}&topic_slug=${encodeURIComponent(normalizedTopic)}`);
    //   const found = (topics as unknown as any[]).find((t: any) => t.slug === decodedTopicSlug || t.slug === normalizedTopic) || null;
    //   if (!found) return null;
    //   const topic = { ...found } as any;
    //   if (!topic.chapter_id && topic.chapter && topic.chapter._id) {
    //     topic.chapter_id = topic.chapter._id;
    //   }
    //   if (!topic.chapter_id) {
    //     return null;
    //   }
    //   if (!Array.isArray(topic.supported_language_ids)) {
    //     topic.supported_language_ids = [];
    //   }
    //   if (topic.hasOwnProperty('tag') && !Array.isArray(topic.tag)) {
    //     topic.tag = [];
    //   }
    //   return topic;
    // },

    // getTopicsByBoardClassSubjectAndChapter: async (_: any, args: any) => {
    //   const { board_short_code, class_grade, subject_code, chapter_slug } = args;
    //   // Decode URL-encoded slugs
    //   const decodedChapterSlug = decodeURIComponent(chapter_slug);
    //   const normalizedChapter = decodedChapterSlug.replace(/-/g, ' ');
    //   const topics = await apiClient.get(`/content/topics?board_short_code=${board_short_code}&class_grade=${class_grade}&subject_code=${subject_code}&chapter_slug=${encodeURIComponent(normalizedChapter)}`);
    //   const list = Array.isArray(topics) ? topics : [];
    //   return list
    //     .map((t: any) => {
    //       const topic = { ...t };
    //       if (!topic.chapter_id && topic.chapter && topic.chapter._id) {
    //         topic.chapter_id = topic.chapter._id;
    //       }
    //       if (!Array.isArray(topic.supported_language_ids)) {
    //         topic.supported_language_ids = [];
    //       }
    //       if (topic.hasOwnProperty('tag') && !Array.isArray(topic.tag)) {
    //         topic.tag = [];
    //       }
    //       return topic;
    //     })
    //     .filter((t: any) => Boolean(t.chapter_id));
    // },

    // ============================================
    // SUBTOPIC RESOLVERS (Now available in Education-AI)
    // ============================================
    subTopics: async () => {
      return await subtopicService.getSubtopics();
    },

    // subTopic: async (_: any, { slug }: { slug: string }) => {
    //   const decodedSlug = decodeURIComponent(slug);
    //   return await apiClient.get(`/content/subtopics/by-slug?slug=${encodeURIComponent(decodedSlug)}`);
    // },

    // getSubTopicByBoardClassSubjectChapterTopicAndSubTopic: async (_: any, args: any) => {
    //   const { board_short_code, class_grade, subject_code, chapter_slug, topic_slug, subtopic_slug } = args;
    //   // Decode URL-encoded slugs
    //   const decodedChapterSlug = decodeURIComponent(chapter_slug);
    //   const decodedTopicSlug = decodeURIComponent(topic_slug);
    //   const decodedSubtopicSlug = decodeURIComponent(subtopic_slug);
    //   const normalizedChapter = decodedChapterSlug.replace(/-/g, ' ');
    //   const normalizedTopic = decodedTopicSlug.replace(/-/g, ' ');
    //   const normalizedSubtopic = decodedSubtopicSlug.replace(/-/g, ' ');
    //   const subtopics = await apiClient.get(`/content/subtopics?board_short_code=${board_short_code}&class_grade=${class_grade}&subject_code=${subject_code}&chapter_slug=${encodeURIComponent(normalizedChapter)}&topic_slug=${encodeURIComponent(normalizedTopic)}`);
    //   return (subtopics as unknown as any[]).find((st: any) => st.slug === decodedSubtopicSlug || st.slug === normalizedSubtopic) || null;
    // },

    // getSubTopicsByBoardClassSubjectChapterAndTopic: async (_: any, args: any) => {
    //   const { board_short_code, class_grade, subject_code, chapter_slug, topic_slug } = args;
    //   // Decode URL-encoded slugs
    //   const decodedChapterSlug = decodeURIComponent(chapter_slug);
    //   const decodedTopicSlug = decodeURIComponent(topic_slug);
    //   const normalizedChapter = decodedChapterSlug.replace(/-/g, ' ');
    //   const normalizedTopic = decodedTopicSlug.replace(/-/g, ' ');
    //   return await apiClient.get(`/content/subtopics?board_short_code=${board_short_code}&class_grade=${class_grade}&subject_code=${subject_code}&chapter_slug=${encodeURIComponent(normalizedChapter)}&topic_slug=${encodeURIComponent(normalizedTopic)}`);
    // },

    // ============================================
    // MCQ RESOLVERS
    // ============================================
    mcqs: async (_: any, args: { entity_type?: string; entity_id?: string; page?: number; limit?: number }) => {
      const { entity_type, entity_id, page = 1, limit = 10 } = args;

      const response = await mcqService.getAllMCQs(
        entity_type as string,
        entity_id as string,
      );
      return (response as any).data || response;
    },

    mcq: async (_: any, { id }: { id: string }) => {
      return await mcqService.getMCQById(id);
    },

    mcqsWithPagination: async (_: any, args: { entity_type?: string; entity_id?: string; page?: number; limit?: number }) => {
      const { entity_type, entity_id, page = 1, limit = 10 } = args;

      const response: any = await mcqService.getMCQsWithPagination(
        Number(page),
        Number(limit),
        entity_type as string,
        entity_id as string,
      );

      return {
        data: {
          mcqs: response.data || response.mcqs || []
        },
        total: response.total || 0,
        page: response.page || page,
        limit: response.limit || limit,
        totalPages: response.totalPages || Math.ceil((response.total || 0) / limit)
      };
    },

    // ============================================
    // FAQ RESOLVERS
    // ============================================
    faqs: async (_: any, args: { entity_type?: string; entity_id?: string; page?: number; limit?: number }) => {
      const { entity_type, entity_id, page = 1, limit = 10 } = args;
      return await faqService.getAllFAQs(
        entity_type as string,
        entity_id as string
      );
    },

    faq: async (_: any, { id }: { id: string }) => {
      return await faqService.getFAQById(id);
    },

    faqsWithPagination: async (_: any, args: { entity_type?: string; entity_id?: string; page?: number; limit?: number }) => {
      const { entity_type, entity_id, page = 1, limit = 10 } = args;

      const response: any = await faqService.getFAQsWithPagination(
        Number(page),
        Number(limit),
        entity_type as string,
        entity_id as string,
      );

      return {
        data: {
          faqs: response.data || response.faqs || []
        },
        total: response.total || 0,
        page: response.page || page,
        limit: response.limit || limit,
        totalPages: response.totalPages || Math.ceil((response.total || 0) / limit)
      };
    },

    // ============================================
    // DESCRIPTIVE QUESTION RESOLVERS
    // ============================================
    descriptiveQuestions: async (_: any, args: { entity_type?: string; entity_id?: string; page?: number; limit?: number }) => {
      const { entity_type, entity_id, page = 1, limit = 10 } = args;

      return await descriptiveQuestionService.getAllDescriptiveQuestions(
        entity_type as string,
        entity_id as string
      );
    },

    descriptiveQuestion: async (_: any, { id }: { id: string }) => {
      return await descriptiveQuestionService.getDescriptiveQuestionById(id);
    },

    descriptiveQuestionsWithPagination: async (_: any, args: { entity_type?: string; entity_id?: string; page?: number; limit?: number }) => {
      const { entity_type, entity_id, page = 1, limit = 10 } = args;

      const response: any = await descriptiveQuestionService.getDescriptiveQuestionsWithPagination(
        Number(page),
        Number(limit),
        entity_type as string,
        entity_id as string,
      );

      return {
        data: {
          descriptiveQuestions: response.data || response.descriptiveQuestions || []
        },
        total: response.total || 0,
        page: response.page || page,
        limit: response.limit || limit,
        totalPages: response.totalPages || Math.ceil((response.total || 0) / limit)
      };
    },

    // ============================================
    // GB CATEGORY RESOLVERS
    // ============================================
    gbCategories: async () => {
      return await gbCategoryService.getAllGBCategories();
    },

    gbCategory: async (_: any, { id }: { id: string }) => {
      return await gbCategoryService.getGBCategoryById(id);
    },

    gbCategoryBySlug: async (_: any, { slug }: { slug: string }) => {
      const decodedSlug = decodeURIComponent(slug);
      const categories = await gbCategoryService.getAllGBCategories();
      return (categories as unknown as any[]).find((c: any) => c.slug === decodedSlug) || null;
    },

    // ============================================
    // GB TOPIC RESOLVERS
    // ============================================
    gbTopics: async () => {
      return await gbTopicService.getAllGBTopics();
    },

    gbTopic: async (_: any, { id }: { id: string }) => {
      return await gbTopicService.getGBTopicById(id);
    },

    gbTopicsByCategory: async (_: any, { gb_category_id }: { gb_category_id: string }) => {
      return await gbTopicService.getAllGBTopics(gb_category_id as string);
    },

    // ============================================
    // GB SUBTOPIC RESOLVERS
    // ============================================
    gbSubtopics: async () => {
      return await gbSubtopicService.getAllGBSubtopics();
    },

    gbSubtopic: async (_: any, { id }: { id: string }) => {
      return await gbSubtopicService.getGBSubtopicById(id);
    },

    gbSubtopicsByTopic: async (_: any, { gb_topic_id }: { gb_topic_id: string }) => {
      return await gbSubtopicService.getAllGBSubtopics(gb_topic_id as string);
    },

    // ============================================
    // GB QUESTION RESOLVERS
    // ============================================
    gbQuestions: async () => {
      return await gbQuestionService.getAllGBQuestions();
    },

    gbQuestion: async (_: any, { id }: { id: string }) => {
      return await gbQuestionService.getGBQuestionById(id);
    },

    gbQuestionsBySubtopic: async (_: any, { gb_subtopic_id }: { gb_subtopic_id: string }) => {
      return await gbQuestionService.getAllGBQuestions(gb_subtopic_id as string);
    },
  },
})

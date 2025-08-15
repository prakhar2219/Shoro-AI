import { getCountry } from '@/lib/api/entities/countries';
import { getBoard } from '@/lib/api/entities/boards';
import { getSubjectsByBoardAndClass } from '@/lib/api/entities/subjects';
import { getChapterBySlug } from '@/lib/api/entities/chapters';
import { getMCQs } from '@/lib/api/entities/mcqs';
import { getFAQs } from '@/lib/api/entities/faqs';
import { getDescriptiveQuestions } from '@/lib/api/entities/descriptiveQuestions';

export interface ChapterData {
  country: any;
  board: any;
  subject: any;
  chapter: any;
  mcqs: any[];
  faqs: any[];
  descriptiveQuestions: any[];
}

export async function getChapterData(countryCode: string, boardCode: string, grade: string, subjectCode: string, chapterSlug: string): Promise<ChapterData> {
  try {
    const gradeNumber = parseInt(grade) || 0;

    // First get the chapter to find its ID
    const chapter = await getChapterBySlug(boardCode, gradeNumber, subjectCode, chapterSlug);
    if (!chapter || !chapter._id) {
      throw new Error('Chapter not found or missing ID');
    }

    // Now fetch all other data using the chapter's actual ID
    const [country, board, subjects, mcqs, faqs, descriptiveQuestions] = await Promise.all([
      getCountry(countryCode),
      getBoard(boardCode),
      getSubjectsByBoardAndClass(boardCode, gradeNumber),
      getMCQs({ entity_type: 'Chapter', entity_id: chapter._id, page: 1, limit: 10 }),
      getFAQs({ entity_type: 'Chapter', entity_id: chapter._id, page: 1, limit: 10 }),
      getDescriptiveQuestions({ entity_type: 'Chapter', entity_id: chapter._id, page: 1, limit: 10 })
    ]);

    // Find the specific subject by code from the subjects list
    const subject = subjects.find((s: any) => s.code === subjectCode);

    return {
      country: country || null,
      board: board || null,
      subject: subject || null,
      chapter: chapter || null,
      mcqs: (mcqs?.data || mcqs || []),
      faqs: (faqs?.data || faqs || []),
      descriptiveQuestions: (descriptiveQuestions?.data || descriptiveQuestions || [])
    };
  } catch (error) {
    console.error('Error fetching chapter data:', error);
    return {
      country: null,
      board: null,
      subject: null,
      chapter: null,
      mcqs: [],
      faqs: [],
      descriptiveQuestions: []
    };
  }
}

export async function getChapterDataWithCache(countryCode: string, boardCode: string, grade: string, subjectCode: string, chapterSlug: string): Promise<ChapterData> {
  // This function can be extended with Redis or other caching mechanisms
  // For now, we'll rely on Next.js built-in caching
  return getChapterData(countryCode, boardCode, grade, subjectCode, chapterSlug);
}

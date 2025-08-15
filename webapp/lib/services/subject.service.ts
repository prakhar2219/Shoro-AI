import { getCountry } from '@/lib/api/entities/countries';
import { getBoard } from '@/lib/api/entities/boards';
import { getSubjectsByBoardAndClass } from '@/lib/api/entities/subjects';
import { getChaptersByBoardClassAndSubject } from '@/lib/api/entities/chapters';
import { getMCQs } from '@/lib/api/entities/mcqs';
import { getFAQs } from '@/lib/api/entities/faqs';
import { getDescriptiveQuestions } from '@/lib/api/entities/descriptiveQuestions';

export interface SubjectData {
  country: any;
  board: any;
  subject: any;
  chapters: any[];
  mcqs: any[];
  faqs: any[];
  descriptiveQuestions: any[];
}

export async function getSubjectData(countryCode: string, boardCode: string, grade: string, subjectCode: string): Promise<SubjectData> {
  try {
    const gradeNumber = parseInt(grade) || 0;

    // First get the subjects to find the specific subject for this code
    const subjects = await getSubjectsByBoardAndClass(boardCode, gradeNumber);
    const subject = subjects.find((s: any) => s.code === subjectCode);
    
    if (!subject || !subject._id) {
      throw new Error('Subject not found or missing ID');
    }

    // Now fetch all other data using the subject's actual ID
    const [country, board, chapters, mcqs, faqs, descriptiveQuestions] = await Promise.all([
      getCountry(countryCode),
      getBoard(boardCode),
      getChaptersByBoardClassAndSubject(boardCode, gradeNumber, subjectCode),
      getMCQs({ entity_type: 'Subject', entity_id: subject._id, page: 1, limit: 10 }),
      getFAQs({ entity_type: 'Subject', entity_id: subject._id, page: 1, limit: 10 }),
      getDescriptiveQuestions({ entity_type: 'Subject', entity_id: subject._id, page: 1, limit: 10 })
    ]);

    return {
      country: country || null,
      board: board || null,
      subject: subject || null,
      chapters: chapters || [],
      mcqs: (mcqs?.data || mcqs || []),
      faqs: (faqs?.data || faqs || []),
      descriptiveQuestions: (descriptiveQuestions?.data || descriptiveQuestions || [])
    };
  } catch (error) {
    console.error('Error fetching subject data:', error);
    return {
      country: null,
      board: null,
      subject: null,
      chapters: [],
      mcqs: [],
      faqs: [],
      descriptiveQuestions: []
    };
  }
}

export async function getSubjectDataWithCache(countryCode: string, boardCode: string, grade: string, subjectCode: string): Promise<SubjectData> {
  // This function can be extended with Redis or other caching mechanisms
  // For now, we'll rely on Next.js built-in caching
  return getSubjectData(countryCode, boardCode, grade, subjectCode);
}

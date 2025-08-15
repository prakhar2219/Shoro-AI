import { getCountry } from '@/lib/api/entities/countries';
import { getBoard } from '@/lib/api/entities/boards';
import { getClassesByBoardShortCode } from '@/lib/api/entities/classes';
import { getSubjectsByBoardAndClass } from '@/lib/api/entities/subjects';
import { getMCQs } from '@/lib/api/entities/mcqs';
import { getFAQs } from '@/lib/api/entities/faqs';
import { getDescriptiveQuestions } from '@/lib/api/entities/descriptiveQuestions';

export interface GradeData {
  country: any;
  board: any;
  classData: any;
  subjects: any[];
  mcqs: any[];
  faqs: any[];
  descriptiveQuestions: any[];
}

export async function getGradeData(countryCode: string, boardCode: string, grade: string): Promise<GradeData> {
  try {
    const gradeNumber = parseInt(grade) || 0;

    // First get the classes to find the specific class for this grade
    const classes = await getClassesByBoardShortCode(boardCode);
    const classData = classes.find((cls: any) => cls.grade === gradeNumber);
    
    if (!classData || !classData._id) {
      throw new Error('Class not found or missing ID');
    }

    // Now fetch all other data using the class's actual ID
    const [country, board, subjects, mcqs, faqs, descriptiveQuestions] = await Promise.all([
      getCountry(countryCode),
      getBoard(boardCode),
      getSubjectsByBoardAndClass(boardCode, gradeNumber),
      getMCQs({ entity_type: 'Class', entity_id: classData._id, page: 1, limit: 10 }),
      getFAQs({ entity_type: 'Class', entity_id: classData._id, page: 1, limit: 10 }),
      getDescriptiveQuestions({ entity_type: 'Class', entity_id: classData._id, page: 1, limit: 10 })
    ]);

    return {
      country: country || null,
      board: board || null,
      classData: classData || null,
      subjects: subjects || [],
      mcqs: (mcqs?.data || mcqs || []),
      faqs: (faqs?.data || faqs || []),
      descriptiveQuestions: (descriptiveQuestions?.data || descriptiveQuestions || [])
    };
  } catch (error) {
    console.error('Error fetching grade data:', error);
    return {
      country: null,
      board: null,
      classData: null,
      subjects: [],
      mcqs: [],
      faqs: [],
      descriptiveQuestions: []
    };
  }
}

export async function getGradeDataWithCache(countryCode: string, boardCode: string, grade: string): Promise<GradeData> {
  // This function can be extended with Redis or other caching mechanisms
  // For now, we'll rely on Next.js built-in caching
  return getGradeData(countryCode, boardCode, grade);
}

import { getCountry } from '@/lib/api/entities/countries';
import { getBoard } from '@/lib/api/entities/boards';
import { getClassesByBoardShortCode } from '@/lib/api/entities/classes';
import { getMCQs } from '@/lib/api/entities/mcqs';
import { getFAQs } from '@/lib/api/entities/faqs';
import { getDescriptiveQuestions } from '@/lib/api/entities/descriptiveQuestions';

export interface BoardData {
  country: any;
  board: any;
  classes: any[];
  mcqs: any[];
  faqs: any[];
  descriptiveQuestions: any[];
}

export async function getBoardData(countryCode: string, boardCode: string): Promise<BoardData> {
  try {
    // First get the board to get its ID
    const board = await getBoard(boardCode);
    if (!board || !board._id) {
      throw new Error('Board not found or missing ID');
    }

    // Now fetch all other data using the board's actual ID
    const [country, classes, mcqs, faqs, descriptiveQuestions] = await Promise.all([
      getCountry(countryCode),
      getClassesByBoardShortCode(boardCode),
      getMCQs({ entity_type: 'Board', entity_id: board._id, page: 1, limit: 10 }),
      getFAQs({ entity_type: 'Board', entity_id: board._id, page: 1, limit: 10 }),
      getDescriptiveQuestions({ entity_type: 'Board', entity_id: board._id, page: 1, limit: 10 })
    ]);

    return {
      country: country || null,
      board: board || null,
      classes: classes || [],
      mcqs: (mcqs?.data || mcqs || []),
      faqs: (faqs?.data || faqs || []),
      descriptiveQuestions: (descriptiveQuestions?.data || descriptiveQuestions || [])
    };
  } catch (error) {
    console.error('Error fetching board data:', error);
    return {
      country: null,
      board: null,
      classes: [],
      mcqs: [],
      faqs: [],
      descriptiveQuestions: []
    };
  }
}

export async function getBoardDataWithCache(countryCode: string, boardCode: string): Promise<BoardData> {
  // This function can be extended with Redis or other caching mechanisms
  // For now, we'll rely on Next.js built-in caching
  return getBoardData(countryCode, boardCode);
}

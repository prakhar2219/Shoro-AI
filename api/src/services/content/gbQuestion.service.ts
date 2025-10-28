import GBQuestionModel from '../../models/content/gbQuestion.model';
import GBSubtopicModel from '../../models/content/gbSubtopic.model';
import LanguageModel from '../../models/content/language.model';
import { IGBQuestion } from '@/types/content/gbQuestion.types';

// Helper function to validate if GB subtopic IDs exist
export const validateGBSubtopicIds = async (subtopicIds: string[]): Promise<{ valid: string[], invalid: string[] }> => {
  const uniqueSubtopicIds = [...new Set(subtopicIds)]; // Remove duplicates
  const existingSubtopics = await GBSubtopicModel.find({ _id: { $in: uniqueSubtopicIds } }).select('_id');
  const existingSubtopicIds = existingSubtopics.map(s => s._id.toString());
  
  const valid = uniqueSubtopicIds.filter(id => existingSubtopicIds.includes(id));
  const invalid = uniqueSubtopicIds.filter(id => !existingSubtopicIds.includes(id));
  
  return { valid, invalid };
};

// Helper function to validate if language IDs exist
export const validateLanguageIds = async (languageIds: string[]): Promise<{ valid: string[], invalid: string[] }> => {
  const uniqueLanguageIds = [...new Set(languageIds)]; // Remove duplicates
  const existingLanguages = await LanguageModel.find({ _id: { $in: uniqueLanguageIds } }).select('_id');
  const existingLanguageIds = existingLanguages.map(l => l._id.toString());
  
  const valid = uniqueLanguageIds.filter(id => existingLanguageIds.includes(id));
  const invalid = uniqueLanguageIds.filter(id => !existingLanguageIds.includes(id));
  
  return { valid, invalid };
};

// Check for duplicate slug within GB subtopic
export const checkDuplicateSlug = async (gb_subtopic_id: string, slug: string, excludeId?: string) => {
  const query: any = { gb_subtopic_id, slug };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  return await GBQuestionModel.findOne(query);
};

// Check for duplicate order within GB subtopic
export const checkDuplicateOrder = async (gb_subtopic_id: string, order: number, excludeId?: string) => {
  const query: any = { gb_subtopic_id, order };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  return await GBQuestionModel.findOne(query);
};

export const createGBQuestion = async (data: IGBQuestion) => {
  return await GBQuestionModel.create(data);
};

// Bulk create GB questions (with duplicate handling)
export const bulkCreateGBQuestions = async (questions: IGBQuestion[]) => {
  try {
    return await GBQuestionModel.insertMany(questions as any[], { ordered: false });
  } catch (error: any) {
    if (error?.writeErrors && error?.insertedIds) {
      return error.insertedIds;
    }
    throw error;
  }
};

export const getAllGBQuestions = async (gb_subtopic_id?: string, language_id?: string) => {
  const filter: any = {};
  if (gb_subtopic_id) filter.gb_subtopic_id = gb_subtopic_id;
  if (language_id) filter.language_id = language_id;
  
  return await GBQuestionModel.find(filter)
    .populate({
      path: 'gb_subtopic_id',
      populate: {
        path: 'gb_topic_id',
        populate: { path: 'gb_category_id' }
      }
    })
    .populate('language_id')
    .populate('created_by')
    .sort({ order: 1, question: 1 });
};

export const getGBQuestionById = async (id: string) => {
  return await GBQuestionModel.findById(id)
    .populate({
      path: 'gb_subtopic_id',
      populate: {
        path: 'gb_topic_id',
        populate: { path: 'gb_category_id' }
      }
    })
    .populate('language_id')
    .populate('created_by');
};

export const updateGBQuestion = async (id: string, data: Partial<IGBQuestion>) => {
  return await GBQuestionModel.findByIdAndUpdate(id, data, { new: true });
};

export const deleteGBQuestion = async (id: string) => {
  return await GBQuestionModel.findByIdAndDelete(id);
};

// Paginated GB questions
export const getGBQuestionsWithPagination = async (
  page: number = 1,
  limit: number = 10,
  gb_subtopic_id?: string,
  search?: string,
  language_id?: string,
  difficulty_level?: string
) => {
  const skip = (page - 1) * limit;
  const filter: any = {};
  
  if (gb_subtopic_id) filter.gb_subtopic_id = gb_subtopic_id;
  if (language_id) filter.language_id = language_id;
  if (difficulty_level) filter.difficulty_level = difficulty_level;
  
  if (search) {
    const searchRegex = new RegExp(search, 'i');
    filter.$or = [
      { question: searchRegex },
      { answer: searchRegex },
      { tag: { $in: [searchRegex] } }
    ];
  }

  const [questions, total] = await Promise.all([
    GBQuestionModel.find(filter)
      .populate({
        path: 'gb_subtopic_id',
        populate: {
          path: 'gb_topic_id',
          populate: { path: 'gb_category_id' }
        }
      })
      .populate('language_id')
      .populate('created_by')
      .sort({ order: 1, question: 1 })
      .skip(skip)
      .limit(limit),
    GBQuestionModel.countDocuments(filter)
  ]);

  return {
    data: questions,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
};

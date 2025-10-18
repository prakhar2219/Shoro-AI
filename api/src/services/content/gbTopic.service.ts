import GBTopicModel from '../../models/content/gbTopic.model';
import GBCategoryModel from '../../models/content/gbCategory.model';
import LanguageModel from '../../models/content/language.model';
import { IGBTopic } from '@/types/content/gbTopic.types';

// Helper function to validate if GB category IDs exist
export const validateGBCategoryIds = async (categoryIds: string[]): Promise<{ valid: string[], invalid: string[] }> => {
  const uniqueCategoryIds = [...new Set(categoryIds)]; // Remove duplicates
  const existingCategories = await GBCategoryModel.find({ _id: { $in: uniqueCategoryIds } }).select('_id');
  const existingCategoryIds = existingCategories.map(c => c._id.toString());
  
  const valid = uniqueCategoryIds.filter(id => existingCategoryIds.includes(id));
  const invalid = uniqueCategoryIds.filter(id => !existingCategoryIds.includes(id));
  
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

export const createGBTopic = async (data: IGBTopic) => {
  return await GBTopicModel.create(data);
};

// Bulk create GB topics (with duplicate handling)
export const bulkCreateGBTopics = async (topics: IGBTopic[]) => {
  try {
    return await GBTopicModel.insertMany(topics as any[], { ordered: false });
  } catch (error: any) {
    if (error?.writeErrors && error?.insertedIds) {
      return error.insertedIds;
    }
    throw error;
  }
};

export const getAllGBTopics = async (gb_category_id?: string, language_id?: string) => {
  const filter: any = {};
  if (gb_category_id) filter.gb_category_id = gb_category_id;
  if (language_id) filter.language_id = language_id;
  
  return await GBTopicModel.find(filter)
    .populate('gb_category_id')
    .populate('language_id')
    .populate('created_by')
    .sort({ order: 1, name: 1 });
};

export const getGBTopicById = async (id: string) => {
  return await GBTopicModel.findById(id)
    .populate('gb_category_id')
    .populate('language_id')
    .populate('created_by');
};

export const updateGBTopic = async (id: string, data: Partial<IGBTopic>) => {
  return await GBTopicModel.findByIdAndUpdate(id, data, { new: true });
};

export const deleteGBTopic = async (id: string) => {
  return await GBTopicModel.findByIdAndDelete(id);
};

// Paginated GB topics
export const getGBTopicsWithPagination = async (
  page: number = 1,
  limit: number = 10,
  gb_category_id?: string,
  search?: string,
  language_id?: string
) => {
  const skip = (page - 1) * limit;
  const filter: any = {};
  
  if (gb_category_id) filter.gb_category_id = gb_category_id;
  if (language_id) filter.language_id = language_id;
  
  if (search) {
    const searchRegex = new RegExp(search, 'i');
    filter.$or = [
      { name: searchRegex },
      { description: searchRegex },
      { tag: { $in: [searchRegex] } }
    ];
  }

  const [topics, total] = await Promise.all([
    GBTopicModel.find(filter)
      .populate('gb_category_id')
      .populate('language_id')
      .populate('created_by')
      .sort({ order: 1, name: 1 })
      .skip(skip)
      .limit(limit),
    GBTopicModel.countDocuments(filter)
  ]);

  return {
    data: topics,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
};

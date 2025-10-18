import GBCategoryModel from '../../models/content/gbCategory.model';
import LanguageModel from '../../models/content/language.model';
import { IGBCategory } from '@/types/content/gbCategory.types';

// Helper function to validate if language IDs exist
export const validateLanguageIds = async (languageIds: string[]): Promise<{ valid: string[], invalid: string[] }> => {
  const uniqueLanguageIds = [...new Set(languageIds)]; // Remove duplicates
  const existingLanguages = await LanguageModel.find({ _id: { $in: uniqueLanguageIds } }).select('_id');
  const existingLanguageIds = existingLanguages.map(l => l._id.toString());
  
  const valid = uniqueLanguageIds.filter(id => existingLanguageIds.includes(id));
  const invalid = uniqueLanguageIds.filter(id => !existingLanguageIds.includes(id));
  
  return { valid, invalid };
};

export const createGBCategory = async (data: IGBCategory) => {
  return await GBCategoryModel.create(data);
};

// Bulk create GB categories (with duplicate handling)
export const bulkCreateGBCategories = async (categories: IGBCategory[]) => {
  try {
    return await GBCategoryModel.insertMany(categories as any[], { ordered: false });
  } catch (error: any) {
    if (error?.writeErrors && error?.insertedIds) {
      return error.insertedIds;
    }
    throw error;
  }
};

export const getAllGBCategories = async (language_id?: string) => {
  const filter: any = {};
  if (language_id) filter.language_id = language_id;
  
  return await GBCategoryModel.find(filter)
    .populate('language_id')
    .populate('created_by')
    .sort({ order: 1, name: 1 });
};

export const getGBCategoryById = async (id: string) => {
  return await GBCategoryModel.findById(id)
    .populate('language_id')
    .populate('created_by');
};

export const updateGBCategory = async (id: string, data: Partial<IGBCategory>) => {
  return await GBCategoryModel.findByIdAndUpdate(id, data, { new: true });
};

export const deleteGBCategory = async (id: string) => {
  return await GBCategoryModel.findByIdAndDelete(id);
};

// Paginated GB categories
export const getGBCategoriesWithPagination = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
  language_id?: string
) => {
  const skip = (page - 1) * limit;
  const filter: any = {};
  
  if (search) {
    const searchRegex = new RegExp(search, 'i');
    filter.$or = [
      { name: searchRegex },
      { description: searchRegex },
      { tag: { $in: [searchRegex] } }
    ];
  }
  
  if (language_id) filter.language_id = language_id;

  const [categories, total] = await Promise.all([
    GBCategoryModel.find(filter)
      .populate('language_id')
      .populate('created_by')
      .sort({ order: 1, name: 1 })
      .skip(skip)
      .limit(limit),
    GBCategoryModel.countDocuments(filter)
  ]);

  return {
    data: categories,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
};

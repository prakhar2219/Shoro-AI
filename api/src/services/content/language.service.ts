import Language from '../../models/content/language.model';
import { ILanguage } from '../../types/content/language.types';

export const createLanguage = async (data: ILanguage) => {
  return await Language.create(data);
};

export const getAllLanguages = async () => {
  return await Language.find().sort({ createdAt: -1 });
};

export const getLanguageByCode = async (code: string) => {
  return await Language.findOne({ code });
};

export const updateLanguage = async (
  code: string,
  data: Partial<ILanguage>
) => {
  return await Language.findOneAndUpdate({ code }, data, { new: true });
};

export const deleteLanguage = async (code: string) => {
  return await Language.findOneAndDelete({ code });
};

// Search languages by name, code, or native_name
export const searchLanguages = async (query: string) => {
  const searchRegex = new RegExp(query, 'i');
  return await Language.find({
    $or: [
      { name: searchRegex },
      { code: searchRegex },
      { native_name: searchRegex }
    ]
  }).sort({ createdAt: -1 });
};

// Get languages with pagination
export const getLanguagesWithPagination = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
  direction?: 'ltr' | 'rtl',
  ai_supported?: boolean
) => {
  const skip = (page - 1) * limit;
  
  // Build filter object
  const filter: any = {};
  
  if (search) {
    const searchRegex = new RegExp(search, 'i');
    filter.$or = [
      { name: searchRegex },
      { code: searchRegex },
      { native_name: searchRegex }
    ];
  }
  
  if (direction) {
    filter.direction = direction;
  }
  
  if (ai_supported !== undefined) {
    filter.ai_supported = ai_supported;
  }
  
  const [languages, total] = await Promise.all([
    Language.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Language.countDocuments(filter)
  ]);
  
  return {
    data: languages,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
};

// Get AI supported languages only
export const getAISupportedLanguages = async () => {
  return await Language.find({ ai_supported: true }).sort({ createdAt: -1 });
};

// Get languages by direction
export const getLanguagesByDirection = async (direction: 'ltr' | 'rtl') => {
  return await Language.find({ direction }).sort({ createdAt: -1 });
};

// Get languages with filters
export const getLanguagesWithFilters = async (filters: {
  search?: string;
  direction?: 'ltr' | 'rtl';
  ai_supported?: boolean;
  page?: number;
  limit?: number;
}) => {
  const { search, direction, ai_supported, page = 1, limit = 10 } = filters;
  
  if (search) {
    return await searchLanguages(search);
  }
  
  if (direction) {
    return await getLanguagesByDirection(direction);
  }
  
  if (ai_supported !== undefined) {
    return await getAISupportedLanguages();
  }
  
  return await getLanguagesWithPagination(page, limit);
};

// Bulk create languages
export const bulkCreateLanguages = async (languages: ILanguage[]) => {
  try {
    return await Language.insertMany(languages, { ordered: false });
  } catch (error: any) {
    // If it's a bulk write error, continue with successful insertions
    if (error.writeErrors && error.insertedIds) {
      // Return the successfully inserted documents
      const insertedIds = Object.values(error.insertedIds);
      return insertedIds.map((id: any) => ({ _id: id }));
    }
    throw error;
  }
};

// Check if language code exists
export const languageCodeExists = async (code: string, excludeId?: string) => {
  const filter: any = { code };
  if (excludeId) {
    filter._id = { $ne: excludeId };
  }
  return await Language.exists(filter);
};

// Get language statistics
export const getLanguageStats = async () => {
  const [total, aiSupported, ltrCount, rtlCount] = await Promise.all([
    Language.countDocuments(),
    Language.countDocuments({ ai_supported: true }),
    Language.countDocuments({ direction: 'ltr' }),
    Language.countDocuments({ direction: 'rtl' })
  ]);
  
  return {
    total,
    aiSupported,
    ltrCount,
    rtlCount
  };
};

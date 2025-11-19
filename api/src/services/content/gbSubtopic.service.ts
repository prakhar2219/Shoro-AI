import GBSubtopicModel from '../../models/content/gbSubtopic.model';
import GBTopicModel from '../../models/content/gbTopic.model';
import LanguageModel from '../../models/content/language.model';
import { IGBSubtopic } from '@/types/content/gbSubtopic.types';

// Helper function to validate if GB topic IDs exist
export const validateGBTopicIds = async (topicIds: string[]): Promise<{ valid: string[], invalid: string[] }> => {
  const uniqueTopicIds = [...new Set(topicIds)]; // Remove duplicates
  const existingTopics = await GBTopicModel.find({ _id: { $in: uniqueTopicIds } }).select('_id');
  const existingTopicIds = existingTopics.map(t => t._id.toString());
  
  const valid = uniqueTopicIds.filter(id => existingTopicIds.includes(id));
  const invalid = uniqueTopicIds.filter(id => !existingTopicIds.includes(id));
  
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

export const resolveLanguageIdentifier = async (identifier: string): Promise<string | null> => {
  if (!identifier) return null;
  const id = identifier.toString().trim();
  if (id.match(/^[a-fA-F0-9]{24}$/)) return id;
  const byCode = await LanguageModel.findOne({ code: new RegExp(`^${id}$`, 'i') }).select('_id');
  if (byCode) return byCode._id.toString();
  const byName = await LanguageModel.findOne({ $or: [
    { name: new RegExp(`^${id}$`, 'i') },
    { native_name: new RegExp(`^${id}$`, 'i') }
  ] }).select('_id');
  return byName ? byName._id.toString() : null;
};

// Check for duplicate slug within GB topic
export const checkDuplicateSlug = async (gb_topic_id: string, slug: string, excludeId?: string) => {
  const query: any = { gb_topic_id, slug };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  return await GBSubtopicModel.findOne(query);
};

// Check for duplicate order within GB topic
export const checkDuplicateOrder = async (gb_topic_id: string, order: number, excludeId?: string) => {
  const query: any = { gb_topic_id, order };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  return await GBSubtopicModel.findOne(query);
};

export const createGBSubtopic = async (data: IGBSubtopic) => {
  return await GBSubtopicModel.create(data);
};

// Bulk create GB subtopics (with duplicate handling)
export const bulkCreateGBSubtopics = async (subtopics: IGBSubtopic[]) => {
  try {
    return await GBSubtopicModel.insertMany(subtopics as any[], { ordered: false });
  } catch (error: any) {
    if (error?.writeErrors && error?.insertedIds) {
      return error.insertedIds;
    }
    throw error;
  }
};

export const getAllGBSubtopics = async (gb_topic_id?: string, language_id?: string) => {
  const filter: any = {};
  if (gb_topic_id) filter.gb_topic_id = gb_topic_id;
  if (language_id) filter.language_id = language_id;
  
  return await GBSubtopicModel.find(filter)
    .populate({
      path: 'gb_topic_id',
      populate: { path: 'gb_category_id' }
    })
    .populate('language_id')
    .populate('created_by')
    .sort({ order: 1, name: 1 });
};

export const getGBSubtopicById = async (id: string) => {
  return await GBSubtopicModel.findById(id)
    .populate({
      path: 'gb_topic_id',
      populate: { path: 'gb_category_id' }
    })
    .populate('language_id')
    .populate('created_by');
};

export const updateGBSubtopic = async (id: string, data: Partial<IGBSubtopic>) => {
  return await GBSubtopicModel.findByIdAndUpdate(id, data, { new: true });
};

export const deleteGBSubtopic = async (id: string) => {
  return await GBSubtopicModel.findByIdAndDelete(id);
};

// Paginated GB subtopics
export const getGBSubtopicsWithPagination = async (
  page: number = 1,
  limit: number = 10,
  gb_topic_id?: string,
  search?: string,
  language_id?: string
) => {
  const skip = (page - 1) * limit;
  const filter: any = {};
  
  if (gb_topic_id) filter.gb_topic_id = gb_topic_id;
  if (language_id) filter.language_id = language_id;
  
  if (search) {
    const searchRegex = new RegExp(search, 'i');
    filter.$or = [
      { name: searchRegex },
      { description: searchRegex },
      { tag: { $in: [searchRegex] } }
    ];
  }

  const [subtopics, total] = await Promise.all([
    GBSubtopicModel.find(filter)
      .populate({
        path: 'gb_topic_id',
        populate: { path: 'gb_category_id' }
      })
      .populate('language_id')
      .populate('created_by')
      .sort({ order: 1, name: 1 })
      .skip(skip)
      .limit(limit),
    GBSubtopicModel.countDocuments(filter)
  ]);

  return {
    data: subtopics,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
};

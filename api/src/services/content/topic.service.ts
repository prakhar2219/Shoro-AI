import Topic from '../../models/content/topic.model';
import TopicTranslation from '../../models/content/topicTranslation.model';
import ChapterModel from '../../models/content/chapter.model';
import LanguageModel from '../../models/content/language.model';
import { ITopic } from '@/types/content/topic.types';
import { ITopicTranslation } from '@/types/content/topicTranslation.types';

// Helper function to validate if chapter IDs exist
export const validateChapterIds = async (chapterIds: string[]): Promise<{ valid: string[], invalid: string[] }> => {
  const uniqueChapterIds = [...new Set(chapterIds)]; // Remove duplicates
  const existingChapters = await ChapterModel.find({ _id: { $in: uniqueChapterIds } }).select('_id');
  const existingChapterIds = existingChapters.map(c => c._id.toString());
  
  const valid = uniqueChapterIds.filter(id => existingChapterIds.includes(id));
  const invalid = uniqueChapterIds.filter(id => !existingChapterIds.includes(id));
  
  return { valid, invalid };
};

// Helper function to validate if language IDs exist
export const validateLanguageIds = async (languageIds: string[]): Promise<{ valid: string[], invalid: string[] }> => {
  const uniqueLanguageIds = [...new Set(languageIds)];
  const existingLanguages = await LanguageModel.find({ _id: { $in: uniqueLanguageIds } }).select('_id');
  const existingLanguageIds = existingLanguages.map(l => l._id.toString());
  
  const valid = uniqueLanguageIds.filter(id => existingLanguageIds.includes(id));
  const invalid = uniqueLanguageIds.filter(id => !existingLanguageIds.includes(id));
  
  return { valid, invalid };
};

// Check for duplicate order within chapter
export const checkDuplicateOrder = async (chapter_id: string, order: number, excludeId?: string) => {
  const query: any = { chapter_id, order };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  return await Topic.findOne(query);
};

// Check for duplicate slug
export const checkDuplicateSlug = async (slug: string, excludeId?: string) => {
  const query: any = { slug };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  return await Topic.findOne(query);
};

export const createTopic = async (data: ITopic) => Topic.create(data);

export const bulkCreateTopics = async (rows: ITopic[]) => {
  try {
    return await Topic.insertMany(rows as any[], { ordered: false });
  } catch (error: any) {
    if (error?.writeErrors && error?.insertedIds) return error.insertedIds;
    throw error;
  }
};

export const getTopicsWithPagination = async (
  page = 1,
  limit = 10,
  chapter_id?: string,
  search?: string
) => {
  const skip = (page - 1) * limit;
  const filter: any = {};
  if (chapter_id) filter.chapter_id = chapter_id;
  if (search) {
    const searchRegex = new RegExp(search, 'i');
    filter.$or = [
      { title: searchRegex },
      { slug: searchRegex },
    ];
  }
  const [rows, total] = await Promise.all([
    Topic.find(filter)
      .populate({
        path: 'chapter_id',
        populate: {
          path: 'subject_id',
          populate: {
            path: 'class_id',
            populate: {
              path: 'board_id'
            }
          }
        }
      })
      .populate('language_id')
      .sort({ order: 1 })
      .skip(skip)
      .limit(limit),
    Topic.countDocuments(filter)
  ]);
  return { data: rows, total, page, limit, totalPages: Math.ceil(total / limit) };
};

export const getTopics = async (chapter_id?: string) => {
  const filter: any = {};
  if (chapter_id) filter.chapter_id = chapter_id;
  return Topic.find(filter)
    .populate({
      path: 'chapter_id',
      populate: {
        path: 'subject_id',
        populate: {
          path: 'class_id',
          populate: {
            path: 'board_id'
          }
        }
      }
    })
    .sort({ order: 1 });
};

export const getTopicById = async (id: string) => Topic.findById(id)
  .populate({
    path: 'chapter_id',
    populate: {
      path: 'subject_id',
      populate: {
        path: 'class_id',
        populate: {
          path: 'board_id'
        }
      }
    }
  });

export const updateTopic = async (id: string, data: Partial<ITopic>) => Topic.findByIdAndUpdate(id, data, { new: true });

export const deleteTopic = async (id: string) => Topic.findByIdAndDelete(id);

// Translation management functions
export const createTopicTranslation = async (data: ITopicTranslation) => TopicTranslation.create(data);

export const updateTopicTranslation = async (topic_id: string, language_id: string, data: Partial<ITopicTranslation>) => 
  TopicTranslation.findOneAndUpdate({ topic_id, language_id }, data, { new: true });

export const deleteTopicTranslation = async (topic_id: string, language_id: string) => 
  TopicTranslation.findOneAndDelete({ topic_id, language_id });

export const getTopicTranslations = async (topic_id: string) => 
  TopicTranslation.find({ topic_id }).populate('language_id');

export const getTopicWithTranslations = async (id: string) => {
  const topic = await Topic.findById(id)
    .populate({
      path: 'chapter_id',
      populate: {
        path: 'subject_id',
        populate: {
          path: 'class_id',
          populate: {
            path: 'board_id'
          }
        }
      }
    })
    .populate('language_id')
    .populate('supported_language_ids');
  
  if (!topic) return null;
  
  const translations = await TopicTranslation.find({ topic_id: id }).populate('language_id');
  
  return {
    ...topic.toObject(),
    translations
  };
};



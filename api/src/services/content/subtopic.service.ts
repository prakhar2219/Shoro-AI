import Subtopic from '../../models/content/subtopic.model';
import TopicModel from '../../models/content/topic.model';
import LanguageModel from '../../models/content/language.model';
import { ISubtopic } from '@/types/content/subtopic.types';

// Helper function to validate if topic IDs exist
export const validateTopicIds = async (topicIds: string[]): Promise<{ valid: string[], invalid: string[] }> => {
  const uniqueTopicIds = [...new Set(topicIds)];
  const existingTopics = await TopicModel.find({ _id: { $in: uniqueTopicIds } }).select('_id');
  const existingTopicIds = existingTopics.map(t => t._id.toString());
  
  const valid = uniqueTopicIds.filter(id => existingTopicIds.includes(id));
  const invalid = uniqueTopicIds.filter(id => !existingTopicIds.includes(id));
  
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

// Resolve a language identifier that may be an ObjectId, code, or name
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

// Check for duplicate order within topic
export const checkDuplicateOrder = async (topic_id: string, order: number, excludeId?: string) => {
  const query: any = { topic_id, order };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  return await Subtopic.findOne(query);
};

export const createSubtopic = async (data: ISubtopic) => Subtopic.create(data);

export const bulkCreateSubtopics = async (rows: ISubtopic[]) => {
  try {
    return await Subtopic.insertMany(rows as any[], { ordered: false });
  } catch (error: any) {
    if (error?.writeErrors && error?.insertedIds) return error.insertedIds;
    throw error;
  }
};

export const getSubtopicsWithPagination = async (
  page = 1,
  limit = 10,
  topic_id?: string,
  search?: string
) => {
  const skip = (page - 1) * limit;
  const filter: any = {};
  if (topic_id) filter.topic_id = topic_id;
  if (search) {
    const searchRegex = new RegExp(search, 'i');
    filter.$or = [
      { title: searchRegex },
      { slug: searchRegex },
    ];
  }
  const [rows, total] = await Promise.all([
    Subtopic.find(filter)
      .populate({
        path: 'topic_id',
        populate: {
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
        }
      })
      .populate('language_id')
      .sort({ order: 1 })
      .skip(skip)
      .limit(limit),
    Subtopic.countDocuments(filter)
  ]);
  return { data: rows, total, page, limit, totalPages: Math.ceil(total / limit) };
};

export const getSubtopics = async (topic_id?: string) => {
  const filter: any = {};
  if (topic_id) filter.topic_id = topic_id;
  return Subtopic.find(filter)
    .populate({
      path: 'topic_id',
      populate: {
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
      }
    })
    .populate('language_id')
    .lean()
    .sort({ order: 1 });
};

export const getSubtopicById = async (id: string) => Subtopic.findById(id)
  .populate({
    path: 'topic_id',
    populate: {
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
    }
  });

export const updateSubtopic = async (id: string, data: Partial<ISubtopic>) => Subtopic.findByIdAndUpdate(id, data, { new: true });

export const deleteSubtopic = async (id: string) => Subtopic.findByIdAndDelete(id);



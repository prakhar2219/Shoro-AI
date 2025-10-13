import Subtopic from '../../models/content/subtopic.model';
import TopicModel from '../../models/content/topic.model';
import { ISubtopic } from '@/types/content/subtopic.types';

// Helper function to validate if topic IDs exist
export const validateTopicIds = async (topicIds: string[]): Promise<{ valid: string[], invalid: string[] }> => {
  const uniqueTopicIds = [...new Set(topicIds)]; // Remove duplicates
  const existingTopics = await TopicModel.find({ _id: { $in: uniqueTopicIds } }).select('_id');
  const existingTopicIds = existingTopics.map(t => t._id.toString());
  
  const valid = uniqueTopicIds.filter(id => existingTopicIds.includes(id));
  const invalid = uniqueTopicIds.filter(id => !existingTopicIds.includes(id));
  
  return { valid, invalid };
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
  topic_id?: string
) => {
  const skip = (page - 1) * limit;
  const filter: any = {};
  if (topic_id) filter.topic_id = topic_id;
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



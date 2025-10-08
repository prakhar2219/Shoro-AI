import Topic from '../../models/content/topic.model';
import { ITopic } from '@/types/content/topic.types';

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
  chapter_id?: string
) => {
  const skip = (page - 1) * limit;
  const filter: any = {};
  if (chapter_id) filter.chapter_id = chapter_id;
  const [rows, total] = await Promise.all([
    Topic.find(filter)
      .populate('chapter_id')
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
  return Topic.find(filter).populate('chapter_id').sort({ order: 1 });
};

export const getTopicById = async (id: string) => Topic.findById(id).populate('chapter_id');

export const updateTopic = async (id: string, data: Partial<ITopic>) => Topic.findByIdAndUpdate(id, data, { new: true });

export const deleteTopic = async (id: string) => Topic.findByIdAndDelete(id);



import Subtopic from '../../models/content/subtopic.model';
import { ISubtopic } from '@/types/content/subtopic.types';

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
      .populate('topic_id')
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
  return Subtopic.find(filter).populate('topic_id').sort({ order: 1 });
};

export const getSubtopicById = async (id: string) => Subtopic.findById(id).populate('topic_id');

export const updateSubtopic = async (id: string, data: Partial<ISubtopic>) => Subtopic.findByIdAndUpdate(id, data, { new: true });

export const deleteSubtopic = async (id: string) => Subtopic.findByIdAndDelete(id);



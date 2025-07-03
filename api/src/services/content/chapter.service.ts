// services/chapter.service.ts
import Chapter from '../../models/content/chapter.model';
import { IChapter } from '../../types/content/chapter.types';

export const createChapter = async (data: IChapter) => {
  return await Chapter.create(data);
};

export const getAllChapters = async () => {
  return await Chapter.find()
    .populate('subject_id')
    .populate('created_by')
    .sort({ order: 1 });
};

export const getChapterById = async (id: string) => {
  return await Chapter.findById(id).populate('subject_id').populate('created_by');
};

export const updateChapter = async (id: string, data: Partial<IChapter>) => {
  return await Chapter.findByIdAndUpdate(id, data, { new: true });
};

export const deleteChapter = async (id: string) => {
  return await Chapter.findByIdAndDelete(id);
};
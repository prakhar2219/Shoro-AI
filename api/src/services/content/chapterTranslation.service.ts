import ChapterTranslation from '../../models/content/chapterTranslation.model';
import { IChapterTranslation } from '@/types/content/chapterTranslation.types';

export const createChapterTranslation = async (data: IChapterTranslation) => {
  return await ChapterTranslation.create(data);
};

export const getAllChapterTranslations = async () => {
  return await ChapterTranslation.find()
    .populate('chapter_id')
    .populate('language_id')
    .populate('updated_by');
};

export const getChapterTranslationBySlug = async (slug: string) => {
  return await ChapterTranslation.findOne({ slug })
    .populate('chapter_id')
    .populate('language_id')
    .populate('updated_by');
};

export const updateChapterTranslation = async (
  slug: string,
  data: Partial<IChapterTranslation>
) => {
  return await ChapterTranslation.findOneAndUpdate({ slug }, data, {
    new: true,
  });
};

export const deleteChapterTranslation = async (slug: string) => {
  return await ChapterTranslation.findOneAndDelete({ slug });
};

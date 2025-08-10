// services/chapter.service.ts

import Chapter from '../../models/content/chapter.model';
import ChapterTranslation from '../../models/content/chapterTranslation.model';
import { IChapter } from '../../types/content/chapter.types';

export const createChapter = async (data: IChapter) => {
  return await Chapter.create(data);
};

export const getAllChapters = async () => {
  return await Chapter.find()
    .populate({
      path: 'subject_id',
      populate: { path: 'class_id', populate: { path: 'board_id' } }
    })
    .populate('class_id')
    .populate('board_id')
    .populate('created_by')
    .sort({ order: 1 });
};

export const getChapterById = async (id: string, language_id?: string) => {
  const chapter = await Chapter.findById(id)
    .populate({
      path: 'subject_id',
      populate: { path: 'class_id', populate: { path: 'board_id' } }
    })
    .populate('class_id')
    .populate('board_id')
    .populate('created_by');
  if (!chapter) return null;

  // Fetch all translations for this chapter
  const allTranslations = await ChapterTranslation.find({ chapter_id: chapter._id });

  let translation = null;
  if (language_id) {
    translation = allTranslations.find(
      (t: any) => t.language_id.toString() === language_id
    );
  }
  if (!translation) {
    translation = allTranslations[0] || null;
  }

  return {
    ...chapter.toObject(),
    translation,
    translations: allTranslations,
  };
};

export const updateChapter = async (id: string, data: Partial<IChapter>) => {
  return await Chapter.findByIdAndUpdate(id, data, { new: true });
};

export const deleteChapter = async (id: string) => {
  return await Chapter.findByIdAndDelete(id);
};

// Paginated chapters with filtering by parent
export const getChaptersWithPagination = async (
  page: number = 1,
  limit: number = 10,
  board_id?: string,
  class_id?: string,
  subject_id?: string,
  language_id?: string
) => {
  const skip = (page - 1) * limit;
  const filter: any = {};
  if (board_id) filter.board_id = board_id;
  if (class_id) filter.class_id = class_id;
  if (subject_id) filter.subject_id = subject_id;

  const [chapters, total] = await Promise.all([
    Chapter.find(filter)
      .populate({
        path: 'subject_id',
        populate: { path: 'class_id', populate: { path: 'board_id' } }
      })
      .populate('class_id')
      .populate('board_id')
      .populate('created_by')
      .sort({ order: 1 })
      .skip(skip)
      .limit(limit),
    Chapter.countDocuments(filter)
  ]);

  // Fetch all translations for all chapters in one query
  const chapterIds = chapters.map((c: any) => c._id);
  const allTranslations = await ChapterTranslation.find({ chapter_id: { $in: chapterIds } });

  const chaptersWithTranslations = chapters.map((chapter: any) => {
    let translation = null;
    if (language_id) {
      translation = allTranslations.find(
        (t: any) => t.chapter_id.toString() === chapter._id.toString() && t.language_id.toString() === language_id
      );
    }
    if (!translation) {
      translation = allTranslations.find((t: any) => t.chapter_id.toString() === chapter._id.toString());
    }
    // All translations for this chapter
    const translations = allTranslations.filter((t: any) => t.chapter_id.toString() === chapter._id.toString());
    return {
      ...chapter.toObject(),
      translation,
      translations,
    };
  });

  return {
    data: chaptersWithTranslations,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
};

export const getChaptersByBoardClassAndSubject = async (
  board_short_code: string,
  class_grade: number,
  subject_code: string,
  language_id?: string
) => {
  const chapters = await Chapter.find()
    .populate({
      path: 'board_id',
      match: { short_code: board_short_code }
    })
    .populate({
      path: 'class_id',
      match: { grade: class_grade }
    })
    .populate({
      path: 'subject_id',
      match: { code: subject_code }
    })
    .populate('created_by')
    .sort({ order: 1 });

  // Filter chapters that have the specified board, class, and subject
  const filteredChapters = chapters.filter((chapter: any) => 
    chapter.board_id && chapter.class_id && chapter.subject_id
  );

  // Fetch all translations for all chapters in one query
  const chapterIds = filteredChapters.map((c: any) => c._id);
  const allTranslations = await ChapterTranslation.find({ chapter_id: { $in: chapterIds } });

  // Attach translation for each chapter
  const chaptersWithTranslations = filteredChapters.map((chapter: any) => {
    let translation = null;
    if (language_id) {
      translation = allTranslations.find(
        (t: any) => t.chapter_id.toString() === chapter._id.toString() && t.language_id.toString() === language_id
      );
    }
    if (!translation) {
      translation = allTranslations.find((t: any) => t.chapter_id.toString() === chapter._id.toString());
    }
    // All translations for this chapter
    const translations = allTranslations.filter((t: any) => t.chapter_id.toString() === chapter._id.toString());
    return {
      ...chapter.toObject(),
      translation,
      translations,
    };
  });

  return chaptersWithTranslations;
};

export const getChapterBySlug = async (
  board_short_code: string,
  class_grade: number,
  subject_code: string,
  chapter_slug: string,
  language_id?: string
) => {
  const chapter = await Chapter.findOne()
    .populate({
      path: 'board_id',
      match: { short_code: board_short_code }
    })
    .populate({
      path: 'class_id',
      match: { grade: class_grade }
    })
    .populate({
      path: 'subject_id',
      match: { code: subject_code }
    })
    .populate('created_by')
    .where('slug', chapter_slug);

  if (!chapter) return null;

  // Fetch all translations for this chapter
  const allTranslations = await ChapterTranslation.find({ chapter_id: chapter._id });

  let translation = null;
  if (language_id) {
    translation = allTranslations.find(
      (t: any) => t.language_id.toString() === language_id
    );
  }
  if (!translation) {
    translation = allTranslations[0] || null;
  }

  return {
    ...chapter.toObject(),
    translation,
    translations: allTranslations,
  };
};

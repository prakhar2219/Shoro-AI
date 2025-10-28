// services/chapter.service.ts

import Chapter from '../../models/content/chapter.model';
import ChapterTranslation from '../../models/content/chapterTranslation.model';
import SubjectModel from '../../models/content/subject.model';
import LanguageModel from '../../models/content/language.model';
import { IChapter } from '../../types/content/chapter.types';

// Helper function to validate if subject IDs exist
export const validateSubjectIds = async (subjectIds: string[]): Promise<{ valid: string[], invalid: string[] }> => {
  const uniqueSubjectIds = [...new Set(subjectIds)]; // Remove duplicates
  const existingSubjects = await SubjectModel.find({ _id: { $in: uniqueSubjectIds } }).select('_id');
  const existingSubjectIds = existingSubjects.map(s => s._id.toString());
  
  const valid = uniqueSubjectIds.filter(id => existingSubjectIds.includes(id));
  const invalid = uniqueSubjectIds.filter(id => !existingSubjectIds.includes(id));
  
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

// Check for duplicate order within subject
export const checkDuplicateOrder = async (subject_id: string, order: number, excludeId?: string) => {
  const query: any = { subject_id, order };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  return await Chapter.findOne(query);
};

// Check for duplicate slug within subject and language
export const checkDuplicateSlug = async (subject_id: string, language_id: string, slug: string, excludeId?: string) => {
  const query: any = { subject_id, language_id, slug };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  return await Chapter.findOne(query);
};

export const createChapter = async (data: IChapter) => {
  return await Chapter.create(data);
};

// Bulk create chapters (with duplicate handling)
export const bulkCreateChapters = async (chapters: IChapter[]) => {
  try {
    return await Chapter.insertMany(chapters as any[], { ordered: false });
  } catch (error: any) {
    if (error?.writeErrors && error?.insertedIds) {
      return error.insertedIds;
    }
    throw error;
  }
};

export const getAllChapters = async () => {
  return await Chapter.find()
    .populate({
      path: 'subject_id',
      populate: { path: 'class_id', populate: { path: 'board_id' } }
    })
    .populate('class_id')
    .populate('board_id')
    .populate('language_id')
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
    .populate('language_id')
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
  language_id?: string,
  search?: string
) => {
  const skip = (page - 1) * limit;
  const filter: any = {};
  if (board_id) filter.board_id = board_id;
  if (class_id) filter.class_id = class_id;
  if (subject_id) filter.subject_id = subject_id;
  if (search) {
    const searchRegex = new RegExp(search, 'i');
    filter.$or = [
      { title: searchRegex },
      { slug: searchRegex },
    ];
  }

  const [chapters, total] = await Promise.all([
    Chapter.find(filter)
      .populate({
        path: 'subject_id',
        populate: { path: 'class_id', populate: { path: 'board_id' } }
      })
      .populate('class_id')
      .populate('board_id')
      .populate('language_id')
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
    .populate('language_id')
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
    .populate('language_id')
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

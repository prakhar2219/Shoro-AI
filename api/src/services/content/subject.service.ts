import SubjectModel from '../../models/content/subject.model';
import SubjectTranslation from '../../models/content/subjectTranslation.model';
import ClassModel from '../../models/content/class.model';
import LanguageModel from '../../models/content/language.model';
import { ISubject } from '@/types/content/subject.types';

// Helper function to validate if class IDs exist
export const validateClassIds = async (classIds: string[]): Promise<{ valid: string[], invalid: string[] }> => {
  const uniqueClassIds = [...new Set(classIds)]; // Remove duplicates
  const existingClasses = await ClassModel.find({ _id: { $in: uniqueClassIds } }).select('_id');
  const existingClassIds = existingClasses.map(c => c._id.toString());
  
  const valid = uniqueClassIds.filter(id => existingClassIds.includes(id));
  const invalid = uniqueClassIds.filter(id => !existingClassIds.includes(id));
  
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

export const createSubject = async (data: ISubject) => {
  return await SubjectModel.create(data);
};

// Bulk create subjects (with duplicate handling)
export const bulkCreateSubjects = async (subjects: ISubject[]) => {
  try {
    return await SubjectModel.insertMany(subjects as any[], { ordered: false });
  } catch (error: any) {
    // If it's a bulk write error, continue with successful insertions where possible
    if (error?.writeErrors && error?.insertedIds) {
      return error.insertedIds;
    }
    throw error;
  }
};

export const getAllSubjects = async (language_id?: string) => {
  const subjects = await SubjectModel.find().populate('class_id').populate('language_id');
  if (!language_id) {
    // Return main subject data only, with translation as a separate property
    return subjects.map((subject: any) => ({
      ...subject.toObject(),
      translation: undefined,
    }));
  }
  const subjectsWithTranslations = await Promise.all(
    subjects.map(async (subject: any) => {
      let translation = null;
      if (language_id) {
        translation = await SubjectTranslation.findOne({
          subject_id: subject._id,
          language_id,
        });
      }
      if (!translation) {
        translation = await SubjectTranslation.findOne({
          subject_id: subject._id,
        });
      }
      return {
        ...subject.toObject(),
        translation,
      };
    })
  );
  return subjectsWithTranslations;
};

export const getSubjectById = async (id: string, language_id?: string) => {
  const subject = await SubjectModel.findById(id).populate('class_id').populate('language_id');
  if (!subject) return null;
  let translation = null;
  if (language_id) {
    translation = await SubjectTranslation.findOne({
      subject_id: subject._id,
      language_id,
    });
  }
  if (!translation) {
    translation = await SubjectTranslation.findOne({ subject_id: subject._id });
  }
  return {
    ...subject.toObject(),
    name: translation?.name || subject.name,
    translation,
  };
};

export const updateSubject = async (id: string, data: Partial<ISubject>) => {
  return await SubjectModel.findByIdAndUpdate(id, data, { new: true });
};

export const deleteSubject = async (id: string) => {
  return await SubjectModel.findByIdAndDelete(id);
};

// Paginated subjects with all translations
export const getSubjectsWithPagination = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
  language_id?: string
) => {
  const skip = (page - 1) * limit;
  const filter: any = {};
  if (search) {
    const searchRegex = new RegExp(search, 'i');
    filter.$or = [
      { name: searchRegex },
      { code: searchRegex },
    ];
  }
  const [subjects, total] = await Promise.all([
    SubjectModel.find(filter)
      .populate({
        path: 'class_id',
        populate: { path: 'board_id' }
      })
      .populate('language_id')
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit),
    SubjectModel.countDocuments(filter)
  ]);

  // Fetch all translations for all subjects in one query
  const subjectIds = subjects.map((s: any) => s._id);
  const allTranslations = await SubjectTranslation.find({ subject_id: { $in: subjectIds } });

  const subjectsWithTranslations = subjects.map((subject: any) => {
    let translation = null;
    if (language_id) {
      translation = allTranslations.find(
        (t: any) => t.subject_id.toString() === subject._id.toString() && t.language_id.toString() === language_id
      );
    }
    if (!translation) {
      translation = allTranslations.find((t: any) => t.subject_id.toString() === subject._id.toString());
    }
    // All translations for this subject
    const translations = allTranslations.filter((t: any) => t.subject_id.toString() === subject._id.toString());
    return {
      ...subject.toObject(),
      translation,
      translations,
    };
  });
  return {
    data: subjectsWithTranslations,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
};

// Subject Translation CRUD
export const getSubjectTranslations = async (id: string) => {
  const subject = await SubjectModel.findById(id);
  if (!subject) return [];
  return await SubjectTranslation.find({ subject_id: subject._id });
};

export const createSubjectTranslation = async (id: string, data: any) => {
  const subject = await SubjectModel.findById(id);
  if (!subject) throw new Error('Subject not found');
  // Prevent duplicate translation for same subject/language
  const exists = await SubjectTranslation.findOne({ subject_id: subject._id, language_id: data.language_id });
  if (exists) throw new Error('Translation already exists for this language.');
  return await SubjectTranslation.create({ ...data, subject_id: subject._id });
};

export const updateSubjectTranslation = async (translationId: string, data: any) => {
  return await SubjectTranslation.findByIdAndUpdate(translationId, data, { new: true });
};

export const deleteSubjectTranslation = async (translationId: string) => {
  return await SubjectTranslation.findByIdAndDelete(translationId);
};

export const getSubjectsByBoardAndClass = async (board_short_code: string, class_grade: number, language_id?: string) => {
  const subjects = await SubjectModel.find()
    .populate({
      path: 'class_id',
      populate: {
        path: 'board_id',
        match: { short_code: board_short_code }
      },
      match: { grade: class_grade }
    })
    .sort({ name: 1 });

  // Filter subjects that have the specified board and class grade
  const filteredSubjects = subjects.filter((subject: any) => 
    subject.class_id && subject.class_id.board_id
  );

  // Attach translation for each subject
  const subjectsWithTranslations = await Promise.all(
    filteredSubjects.map(async (subject: any) => {
      let translation = null;
      if (language_id) {
        translation = await SubjectTranslation.findOne({
          subject_id: subject._id,
          language_id,
        });
      }
      if (!translation) {
        translation = await SubjectTranslation.findOne({ subject_id: subject._id });
      }
      return {
        ...subject.toObject(),
        name: translation?.name || subject.name,
        translation,
      };
    })
  );
  return subjectsWithTranslations;
};

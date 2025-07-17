import ClassModel from '../../models/content/class.model';
import ClassTranslation from '../../models/content/classTranslation.model';
import { IClass } from '@/types/content/class.types';

export const createClass = async (data: IClass) => {
  return await ClassModel.create(data);
};

export const getAllClasses = async (language_id?: string) => {
  const classes = await ClassModel.find()
    .populate('board_id')
    .sort({ number: 1 });
  const classesWithTranslations = await Promise.all(
    classes.map(async (cls: any) => {
      let translation = null;
      if (language_id) {
        translation = await ClassTranslation.findOne({
          class_id: cls._id,
          language_id,
        });
      }
      if (!translation) {
        translation = await ClassTranslation.findOne({ class_id: cls._id });
      }
      return {
        ...cls.toObject(),
        name: translation?.name || cls.name,
        translation,
      };
    })
  );
  return classesWithTranslations;
};

export const getClassById = async (id: string, language_id?: string) => {
  const cls = await ClassModel.findById(id).populate('board_id');
  if (!cls) return null;
  let translation = null;
  if (language_id) {
    translation = await ClassTranslation.findOne({
      class_id: cls._id,
      language_id,
    });
  }
  if (!translation) {
    translation = await ClassTranslation.findOne({ class_id: cls._id });
  }
  return {
    ...cls.toObject(),
    name: translation?.name || cls.name,
    translation,
  };
};

export const updateClass = async (id: string, data: Partial<IClass>) => {
  return await ClassModel.findByIdAndUpdate(id, data, { new: true });
};

export const deleteClass = async (id: string) => {
  return await ClassModel.findByIdAndDelete(id);
};

// Paginated classes with all translations
export const getClassesWithPagination = async (
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
      { grade: searchRegex },
    ];
  }
  const [classes, total] = await Promise.all([
    ClassModel.find(filter)
      .populate('board_id')
      .sort({ grade: 1 })
      .skip(skip)
      .limit(limit),
    ClassModel.countDocuments(filter)
  ]);

  // Fetch all translations for all classes in one query
  const classIds = classes.map((c: any) => c._id);
  const allTranslations = await ClassTranslation.find({ class_id: { $in: classIds } });

  const classesWithTranslations = classes.map((cls: any) => {
    let translation = null;
    if (language_id) {
      translation = allTranslations.find(
        (t: any) => t.class_id.toString() === cls._id.toString() && t.language_id.toString() === language_id
      );
    }
    if (!translation) {
      translation = allTranslations.find((t: any) => t.class_id.toString() === cls._id.toString());
    }
    // All translations for this class
    const translations = allTranslations.filter((t: any) => t.class_id.toString() === cls._id.toString());
    return {
      ...cls.toObject(),
      name: translation?.name || cls.name,
      translation,
      translations,
    };
  });
  return {
    data: classesWithTranslations,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
};

// Class Translation CRUD
export const getClassTranslations = async (id: string) => {
  const cls = await ClassModel.findById(id);
  if (!cls) return [];
  return await ClassTranslation.find({ class_id: cls._id });
};

export const createClassTranslation = async (id: string, data: any) => {
  const cls = await ClassModel.findById(id);
  if (!cls) throw new Error('Class not found');
  // Prevent duplicate translation for same class/language
  const exists = await ClassTranslation.findOne({ class_id: cls._id, language_id: data.language_id });
  if (exists) throw new Error('Translation already exists for this language.');
  return await ClassTranslation.create({ ...data, class_id: cls._id });
};

export const updateClassTranslation = async (translationId: string, data: any) => {
  return await ClassTranslation.findByIdAndUpdate(translationId, data, { new: true });
};

export const deleteClassTranslation = async (translationId: string) => {
  return await ClassTranslation.findByIdAndDelete(translationId);
};

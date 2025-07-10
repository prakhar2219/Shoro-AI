import SubjectModel from '../../models/content/subject.model';
import SubjectTranslation from '../../models/content/subjectTranslation.model';
import { ISubject } from '@/types/content/subject.types';

export const createSubject = async (data: ISubject) => {
  return await SubjectModel.create(data);
};

export const getAllSubjects = async (language_id?: string) => {
  const subjects = await SubjectModel.find().populate('class_id');
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
        name: translation?.name || subject.name,
        translation,
      };
    })
  );
  return subjectsWithTranslations;
};

export const getSubjectById = async (id: string, language_id?: string) => {
  const subject = await SubjectModel.findById(id).populate('class_id');
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

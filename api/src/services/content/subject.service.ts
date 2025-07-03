import Subject from '../../models/content/subject.model';
import { ISubject } from '@/types/content/subject.types';

export const createSubject = async (data: ISubject) => {
  return await Subject.create(data);
};

export const getAllSubjects = async () => {
  return await Subject.find().populate('class_id').sort({ createdAt: -1 });
};

export const getSubjectById = async (id: string) => {
  return await Subject.findById(id).populate('class_id');
};

export const updateSubject = async (id: string, data: Partial<ISubject>) => {
  return await Subject.findByIdAndUpdate(id, data, { new: true });
};

export const deleteSubject = async (id: string) => {
  return await Subject.findByIdAndDelete(id);
};

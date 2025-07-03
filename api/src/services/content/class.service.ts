import ClassModel from '../../models/content/class.model';
import { IClass } from '@/types/content/class.types';

export const createClass = async (data: IClass) => {
    return await ClassModel.create(data);
};

export const getAllClasses = async () => {
    return await ClassModel.find().populate('board_id').sort({ number: 1 });
};

export const getClassById = async (id: string) => {
    return await ClassModel.findById(id).populate('board_id');
};

export const updateClass = async (id: string, data: Partial<IClass>) => {
    return await ClassModel.findByIdAndUpdate(id, data, { new: true });
};

export const deleteClass = async (id: string) => {
    return await ClassModel.findByIdAndDelete(id);
};
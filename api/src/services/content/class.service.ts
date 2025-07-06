import ClassModel from '../../models/content/class.model';
import ClassTranslation from '../../models/content/classTranslation.model';
import { IClass } from '@/types/content/class.types';

export const createClass = async (data: IClass) => {
    return await ClassModel.create(data);
};

export const getAllClasses = async (language_id?: string) => {
    const classes = await ClassModel.find().populate('board_id').sort({ number: 1 });
    const classesWithTranslations = await Promise.all(
        classes.map(async (cls: any) => {
            let translation = null;
            if (language_id) {
                translation = await ClassTranslation.findOne({ class_id: cls._id, language_id });
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
        translation = await ClassTranslation.findOne({ class_id: cls._id, language_id });
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
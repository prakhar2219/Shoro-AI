import Language from '../../models/content/language.model';
import { ILanguage } from '../../types/content/language.types';

export const createLanguage = async (data: ILanguage) => {
  return await Language.create(data);
};

export const getAllLanguages = async () => {
  return await Language.find().sort({ createdAt: -1 });
};

export const getLanguageByCode = async (code: string) => {
  return await Language.findOne({ code });
};

export const updateLanguage = async (
  code: string,
  data: Partial<ILanguage>
) => {
  return await Language.findOneAndUpdate({ code }, data, { new: true });
};

export const deleteLanguage = async (code: string) => {
  return await Language.findOneAndDelete({ code });
};

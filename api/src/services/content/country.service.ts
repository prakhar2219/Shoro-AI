import Country from '../../models/content/country.model';
import { ICountry } from '@/types/content/country.types';

export const createCountry = async (data: ICountry) => {
    return await Country.create(data);
};

export const getAllCountries = async () => {
    return await Country.find()
        .populate('default_language_id')
        .populate('supported_language_ids')
        .sort({ createdAt: -1 });
};

export const getCountryByCode = async (code: string) => {
    return await Country.findOne({ code })
        .populate('default_language_id')
        .populate('supported_language_ids');
};

export const updateCountry = async (code: string, data: Partial<ICountry>) => {
    return await Country.findOneAndUpdate({ code }, data, { new: true });
};

export const deleteCountry = async (code: string) => {
    return await Country.findOneAndDelete({ code });
};

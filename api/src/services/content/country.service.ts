import Country from '../../models/content/country.model';
import CountryTranslation from '../../models/content/countryTranslation.model';
import { ICountry } from '@/types/content/country.types';

export const createCountry = async (data: ICountry) => {
    return await Country.create(data);
};

export const getAllCountries = async (language_id?: string) => {
    const countries = await Country.find()
        .populate('default_language_id')
        .populate('supported_language_ids')
        .sort({ createdAt: -1 });
    const countriesWithTranslations = await Promise.all(
        countries.map(async (country: any) => {
            let translation = null;
            if (language_id) {
                translation = await CountryTranslation.findOne({ country_id: country._id, language_id });
            }
            if (!translation) {
                translation = await CountryTranslation.findOne({ country_id: country._id });
            }
            return {
                ...country.toObject(),
                name: translation?.name || country.name,
                translation,
            };
        })
    );
    return countriesWithTranslations;
};

export const getCountryByCode = async (code: string, language_id?: string) => {
    const country = await Country.findOne({ code })
        .populate('default_language_id')
        .populate('supported_language_ids');
    if (!country) return null;
    let translation = null;
    if (language_id) {
        translation = await CountryTranslation.findOne({ country_id: country._id, language_id });
    }
    if (!translation) {
        translation = await CountryTranslation.findOne({ country_id: country._id });
    }
    return {
        ...country.toObject(),
        name: translation?.name || country.name,
        translation,
    };
};

export const updateCountry = async (code: string, data: Partial<ICountry>) => {
    return await Country.findOneAndUpdate({ code }, data, { new: true });
};

export const deleteCountry = async (code: string) => {
    return await Country.findOneAndDelete({ code });
};

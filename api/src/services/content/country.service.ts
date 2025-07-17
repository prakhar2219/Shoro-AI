import Country from '../../models/content/country.model';
import CountryTranslation from '../../models/content/countryTranslation.model';
import { ICountry } from '@/types/content/country.types';

export const createCountry = async (data: ICountry) => {
  return await Country.create(data);
};

export const getAllCountries = async () => {
  return await Country.find().sort({ createdAt: -1 });
};

export const getCountryByCode = async (code: string, language_code?: string) => {
  const country = await Country.findOne({ code });
  if (!country) return null;
  let translation = null;
  if (language_code) {
    translation = await CountryTranslation.findOne({
      country_id: country.code,
      language_code,
    });
  }
  if (!translation) {
    translation = await CountryTranslation.findOne({ country_id: country.code });
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

// Paginated countries
export const getCountriesWithPagination = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
  language_code?: string
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
  const [countries, total] = await Promise.all([
    Country.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Country.countDocuments(filter)
  ]);

  // Fetch all translations for all countries in one query
  const countryCodes = countries.map((c: any) => c.code);
  const allTranslations = await CountryTranslation.find({ country_id: { $in: countryCodes } });

  const countriesWithTranslations = await Promise.all(
    countries.map(async (country: any) => {
      let translation = null;
      if (language_code) {
        translation = allTranslations.find(
          (t: any) => t.country_id === country.code && t.language_code === language_code
        );
      }
      if (!translation) {
        translation = allTranslations.find((t: any) => t.country_id === country.code);
      }
      // All translations for this country
      const translations = allTranslations.filter((t: any) => t.country_id === country.code);
      return {
        ...country.toObject(),
        name: translation?.name || country.name,
        translation,
        translations, // <-- new field
      };
    })
  );
  return {
    data: countriesWithTranslations,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
};

// Search countries by name or code
export const searchCountries = async (query: string, language_code?: string) => {
  const searchRegex = new RegExp(query, 'i');
  const countries = await Country.find({
    $or: [
      { name: searchRegex },
      { code: searchRegex },
    ]
  }).sort({ createdAt: -1 });
  const countriesWithTranslations = await Promise.all(
    countries.map(async (country: any) => {
      let translation = null;
      if (language_code) {
        translation = await CountryTranslation.findOne({
          country_id: country.code,
          language_code,
        });
      }
      if (!translation) {
        translation = await CountryTranslation.findOne({ country_id: country.code });
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

// Bulk create countries (with duplicate handling)
export const bulkCreateCountries = async (countries: ICountry[]) => {
  try {
    return await Country.insertMany(countries, { ordered: false });
  } catch (error: any) {
    if (error.writeErrors && error.insertedIds) {
      const insertedIds = Object.values(error.insertedIds);
      return insertedIds.map((id: any) => ({ _id: id }));
    }
    throw error;
  }
};

// Country statistics
export const getCountryStats = async () => {
  const total = await Country.countDocuments();
  return { total };
};

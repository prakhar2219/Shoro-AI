import { Request, Response } from 'express';
import * as countryService from '../../services/content/country.service';
import { ICountry } from '@/types/content/country.types';
import CountryTranslation from '../../models/content/countryTranslation.model';
import { ICountryTranslation } from '@/types/content/countryTranslation.types';

export const createCountry = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, code, default_language_code, supported_language_codes } = req.body;
    if (!name || !code || !default_language_code) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }
    const country: ICountry = {
      name,
      code,
      default_language_code,
      supported_language_codes: Array.isArray(supported_language_codes)
        ? supported_language_codes
        : [],
    };
    const created = await countryService.createCountry(country);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getCountries = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const language_code = req.query.language_code as string | undefined;
    const countries = await countryService.getAllCountries();
    res.status(200).json(countries);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getCountry = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const language_code = req.query.language_code as string | undefined;
    const country = await countryService.getCountryByCode(
      req.params.code,
      language_code
    );
    if (!country) {
      res.status(404).json({ error: 'Country not found' });
      return;
    }
    res.status(200).json(country);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const updateCountry = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const updated = await countryService.updateCountry(
      req.params.code,
      req.body
    );
    if (!updated) {
      res.status(404).json({ error: 'Country not found' });
      return;
    }
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const deleteCountry = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const deleted = await countryService.deleteCountry(req.params.code);
    if (!deleted) {
      res.status(404).json({ error: 'Country not found' });
      return;
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Paginated countries
export const getCountriesWithPagination = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { page = '1', limit = '10', search, language_code } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const result = await countryService.getCountriesWithPagination(
      pageNum,
      limitNum,
      search as string,
      language_code as string
    );
    // result.data[i] now includes 'translations' array for each country
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Search countries
export const searchCountries = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { q, language_code } = req.query;
    if (!q || typeof q !== 'string') {
      res.status(400).json({ error: 'Search query is required' });
      return;
    }
    const countries = await countryService.searchCountries(q, language_code as string);
    res.status(200).json(countries);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Bulk create countries
export const bulkCreateCountries = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { countries } = req.body;
    if (!Array.isArray(countries) || countries.length === 0) {
      res.status(400).json({ error: 'Countries array is required' });
      return;
    }
    for (const country of countries) {
      if (!country.code || !country.name || !country.default_language_code) {
        res.status(400).json({ error: 'Each country must have code, name, and default_language_code' });
        return;
      }
    }
    const created = await countryService.bulkCreateCountries(countries);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Country statistics
export const getCountryStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const stats = await countryService.getCountryStats();
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Country Translation CRUD
export const createCountryTranslation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.params;
    const { language_code, name, translated_by_ai, needs_review, updated_by } = req.body;
    if (!language_code || !name) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }
    // Prevent duplicate translation for same country/language
    const exists = await CountryTranslation.findOne({ country_id: code, language_code });
    if (exists) {
      res.status(409).json({ error: 'Translation already exists for this language.' });
      return;
    }
    const translation: ICountryTranslation = {
      country_id: code,
      language_code,
      name,
      translated_by_ai,
      needs_review,
      updated_by,
    };
    const created = await CountryTranslation.create(translation);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const updateCountryTranslation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { translationId } = req.params;
    const update = req.body;
    const updated = await CountryTranslation.findByIdAndUpdate(translationId, update, { new: true });
    if (!updated) {
      res.status(404).json({ error: 'Translation not found' });
      return;
    }
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const deleteCountryTranslation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { translationId } = req.params;
    const deleted = await CountryTranslation.findByIdAndDelete(translationId);
    if (!deleted) {
      res.status(404).json({ error: 'Translation not found' });
      return;
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getCountryTranslations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.params;
    const translations = await CountryTranslation.find({ country_id: code });
    res.status(200).json(translations);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getCountryTranslation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { translationId } = req.params;
    const translation = await CountryTranslation.findById(translationId);
    if (!translation) {
      res.status(404).json({ error: 'Translation not found' });
      return;
    }
    res.status(200).json(translation);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

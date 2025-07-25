import { Request, Response } from 'express';
import * as languageService from '../../services/content/language.service';
import { ILanguage } from '../../types/content/language.types';

export const createLanguage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { code, name, native_name, direction, locale, script, ai_supported } =
      req.body;
    if (!code || !name || !native_name) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Check if language code already exists
    const codeExists = await languageService.languageCodeExists(code as string);
    if (codeExists) {
      res.status(409).json({ error: 'Language code already exists' });
      return;
    }

    const language: ILanguage = {
      code,
      name,
      native_name,
      direction: direction || 'ltr',
      locale,
      script,
      ai_supported: typeof ai_supported === 'boolean' ? ai_supported : true,
    } as ILanguage;

    const created = await languageService.createLanguage(language);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getLanguages = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { search, direction, ai_supported, page, limit } = req.query;
    
    // If search parameter is provided, use search functionality
    if (search && typeof search === 'string') {
      const languages = await languageService.searchLanguages(search);
      res.status(200).json(languages);
      return;
    }

    // If direction or ai_supported filters are provided
    if (direction || ai_supported !== undefined) {
      const filters: any = {};
      if (direction) filters.direction = direction;
      if (ai_supported !== undefined) filters.ai_supported = ai_supported === 'true';
      
      const languages = await languageService.getLanguagesWithFilters(filters);
      res.status(200).json(languages);
      return;
    }

    // If pagination parameters are provided
    if (page || limit) {
      const pageNum = parseInt(page as string) || 1;
      const limitNum = parseInt(limit as string) || 10;
      const result = await languageService.getLanguagesWithPagination(pageNum, limitNum);
      res.status(200).json(result);
      return;
    }

    // Default: get all languages
    const languages = await languageService.getAllLanguages();
    res.status(200).json(languages);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getLanguage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const language = await languageService.getLanguageByCode(req.params.code);
    if (!language) {
      res.status(404).json({ error: 'Language not found' });
      return;
    }
    res.status(200).json(language);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const updateLanguage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { code } = req.params;
    const updateData = req.body;

    // Check if the language exists
    const existingLanguage = await languageService.getLanguageByCode(code);
    if (!existingLanguage) {
      res.status(404).json({ error: 'Language not found' });
      return;
    }

    // If code is being updated, check if the new code already exists
    if (updateData.code && updateData.code !== code) {
      const codeExists = await languageService.languageCodeExists(updateData.code, existingLanguage._id?.toString());
      if (codeExists) {
        res.status(409).json({ error: 'Language code already exists' });
        return;
      }
    }

    const updated = await languageService.updateLanguage(code, updateData);
    if (!updated) {
      res.status(404).json({ error: 'Language not found' });
      return;
    }
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const deleteLanguage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const deleted = await languageService.deleteLanguage(req.params.code);
    if (!deleted) {
      res.status(404).json({ error: 'Language not found' });
      return;
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// New endpoints for additional functionality

export const searchLanguages = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string') {
      res.status(400).json({ error: 'Search query is required' });
      return;
    }
    
    const languages = await languageService.searchLanguages(q);
    res.status(200).json(languages);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getLanguagesWithPagination = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { page = '1', limit = '10', search, direction, ai_supported } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const searchQuery = search as string;
    const directionFilter = direction as 'ltr' | 'rtl';
    const aiSupportedFilter = ai_supported === 'true' ? true : ai_supported === 'false' ? false : undefined;
    
    const result = await languageService.getLanguagesWithPagination(
      pageNum,
      limitNum,
      searchQuery,
      directionFilter,
      aiSupportedFilter
    );
    
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getAISupportedLanguages = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const languages = await languageService.getAISupportedLanguages();
    res.status(200).json(languages);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getLanguagesByDirection = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { direction } = req.params;
    if (!direction || !['ltr', 'rtl'].includes(direction)) {
      res.status(400).json({ error: 'Valid direction (ltr or rtl) is required' });
      return;
    }
    
    const languages = await languageService.getLanguagesByDirection(direction as 'ltr' | 'rtl');
    res.status(200).json(languages);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const bulkCreateLanguages = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { languages } = req.body;
    
    if (!Array.isArray(languages) || languages.length === 0) {
      res.status(400).json({ error: 'Languages array is required' });
      return;
    }

    // Validate each language
    for (const lang of languages) {
      if (!lang.code || !lang.name || !lang.native_name) {
        res.status(400).json({ error: 'Each language must have code, name, and native_name' });
        return;
      }
    }

    const created = await languageService.bulkCreateLanguages(languages);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getLanguageStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const stats = await languageService.getLanguageStats();
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

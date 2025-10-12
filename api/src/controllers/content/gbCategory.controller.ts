import { Request, Response } from 'express';
import * as gbCategoryService from '../../services/content/gbCategory.service';
import { IGBCategory } from '@/types/content/gbCategory.types';

export const createGBCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, slug, description, content, language_id, order, image, tag, source, author, is_published, created_by } = req.body;

    if (!name || !slug || !language_id) {
      res.status(400).json({ error: 'Missing required fields: name, slug, language_id' });
      return;
    }

    // Validate language_id exists
    const { valid, invalid } = await gbCategoryService.validateLanguageIds([language_id]);
    if (invalid.length > 0) {
      res.status(400).json({ error: `Invalid language_id: ${invalid.join(', ')}` });
      return;
    }

    const categoryData: IGBCategory = {
      name,
      slug,
      description,
      content,
      language_id,
      order: typeof order === 'number' ? order : Number(order || 0),
      image,
      tag: Array.isArray(tag) ? tag : (tag ? [tag] : []),
      source,
      author,
      is_published: !!is_published,
      created_by,
    } as IGBCategory;

    const created = await gbCategoryService.createGBCategory(categoryData);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Bulk create GB categories
export const bulkCreateGBCategories = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { categories } = req.body as { categories: IGBCategory[] };
    if (!Array.isArray(categories) || categories.length === 0) {
      res.status(400).json({ error: 'categories array is required' });
      return;
    }
    
    // Basic field validation
    for (const c of categories) {
      if (!c.name || !c.slug || !c.language_id) {
        res.status(400).json({ error: 'Each category must have name, slug, and language_id' });
        return;
      }
      // Normalize types
      (c as any).order = typeof c.order === 'number' ? c.order : Number(c.order || 0);
      (c as any).is_published = !!c.is_published;
      (c as any).tag = Array.isArray(c.tag) ? c.tag : (c.tag ? [c.tag] : []);
    }
    
    // Validate all language_ids exist
    const languageIds = categories.map(c => c.language_id.toString());
    const { valid, invalid } = await gbCategoryService.validateLanguageIds(languageIds);
    if (invalid.length > 0) {
      res.status(400).json({ error: `Invalid language_ids: ${invalid.join(', ')}` });
      return;
    }
    
    const created = await gbCategoryService.bulkCreateGBCategories(categories);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getGBCategories = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { page, limit, search, language_id } = req.query;
    
    if (page || limit || search || language_id) {
      const result = await gbCategoryService.getGBCategoriesWithPagination(
        Number(page || 1),
        Number(limit || 10),
        search as string,
        language_id as string
      );
      res.status(200).json(result);
      return;
    }
    
    const categories = await gbCategoryService.getAllGBCategories(language_id as string);
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getGBCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const category = await gbCategoryService.getGBCategoryById(req.params.id);
    if (!category) {
      res.status(404).json({ error: 'GB Category not found' });
      return;
    }
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const updateGBCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const updated = await gbCategoryService.updateGBCategory(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ error: 'GB Category not found' });
      return;
    }
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const deleteGBCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const deleted = await gbCategoryService.deleteGBCategory(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: 'GB Category not found' });
      return;
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

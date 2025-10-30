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

    // Allow duplicate slugs: removed duplicate slug checks

    // Check for duplicate order within language
    const orderNum = typeof order === 'number' ? order : Number(order || 0);
    const existingOrderCategory = await gbCategoryService.checkDuplicateOrder(language_id, orderNum);
    if (existingOrderCategory) {
      res.status(409).json({ 
        error: `A GB Category with order ${orderNum} already exists for this language. Please use a different order number.` 
      });
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
    
    // Resolve language identifiers and basic field validation
    for (const c of categories) {
      if (!c.name || !c.slug || !c.language_id) {
        res.status(400).json({ error: 'Each category must have name, slug, and language_id' });
        return;
      }
      const resolvedLang = await gbCategoryService.resolveLanguageIdentifier((c as any).language_id?.toString());
      if (!resolvedLang) {
        res.status(400).json({ error: `Unable to resolve language_id: ${c.language_id}. Use ObjectId, code, or language name.` });
        return;
      }
      (c as any).language_id = resolvedLang;
      if ((c as any).supported_language_ids && Array.isArray((c as any).supported_language_ids)) {
        const resolved: string[] = [];
        for (const lid of (c as any).supported_language_ids) {
          const r = await gbCategoryService.resolveLanguageIdentifier(lid.toString());
          if (r) resolved.push(r);
        }
        (c as any).supported_language_ids = resolved;
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
    const { slug, language_id, order } = req.body;
    
    // Allow duplicate slugs: removed duplicate slug checks
    
    // Check for duplicate order if order is being updated
    if (order !== undefined && language_id) {
      const existingOrderCategory = await gbCategoryService.checkDuplicateOrder(language_id, order, req.params.id);
      if (existingOrderCategory) {
        res.status(409).json({ 
          error: `A GB Category with order ${order} already exists for this language. Please use a different order number.` 
        });
        return;
      }
    }
    
    const updated = await gbCategoryService.updateGBCategory(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ error: 'GB Category not found' });
      return;
    }
    res.status(200).json(updated);
  } catch (error) {
    if ((error as any).code === 11000) {
      res.status(409).json({ error: 'Duplicate key error. Please check slug and order uniqueness.' });
    } else {
      res.status(500).json({ error: (error as Error).message });
    }
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

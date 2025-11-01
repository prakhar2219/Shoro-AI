import { Request, Response } from 'express';
import * as gbTopicService from '../../services/content/gbTopic.service';
import { IGBTopic } from '@/types/content/gbTopic.types';
import { formatSlug, validateSlugFormat } from '../../utils/validators';

export const createGBTopic = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { gb_category_id, name, slug, description, content, language_id, order, image, tag, source, author, is_published, created_by } = req.body;

    if (!gb_category_id || !name || !slug || !language_id) {
      res.status(400).json({ error: 'Missing required fields: gb_category_id, name, slug, language_id' });
      return;
    }

    // Format and validate slug format (ensure no spaces, use hyphens)
    const slugError = validateSlugFormat(slug);
    if (slugError) {
      res.status(400).json({ error: `GB Topic slug validation failed: ${slugError}. Slug: "${slug}"` });
      return;
    }
    const formattedSlug = formatSlug(slug);

    // Validate GB category ID exists
    const { invalid: invalidCategories } = await gbTopicService.validateGBCategoryIds([gb_category_id.toString()]);
    if (invalidCategories.length > 0) {
      res.status(400).json({ 
        error: `Invalid gb_category_id: ${gb_category_id}. Please ensure the GB category ID exists in the database.` 
      });
      return;
    }

    // Validate language_id exists
    const { invalid: invalidLanguages } = await gbTopicService.validateLanguageIds([language_id]);
    if (invalidLanguages.length > 0) {
      res.status(400).json({ error: `Invalid language_id: ${invalidLanguages.join(', ')}` });
      return;
    }

    // Allow duplicate slugs: removed duplicate slug checks

    // Check for duplicate order within GB category
    const orderNum = typeof order === 'number' ? order : Number(order || 0);
    const existingOrderTopic = await gbTopicService.checkDuplicateOrder(gb_category_id, orderNum);
    if (existingOrderTopic) {
      res.status(409).json({ 
        error: `A GB Topic with order ${orderNum} already exists for this GB category. Please use a different order number.` 
      });
      return;
    }

    const topicData: IGBTopic = {
      gb_category_id,
      name,
      slug: formattedSlug,
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
    } as IGBTopic;

    const created = await gbTopicService.createGBTopic(topicData);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Bulk create GB topics
export const bulkCreateGBTopics = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { topics } = req.body as { topics: IGBTopic[] };
    if (!Array.isArray(topics) || topics.length === 0) {
      res.status(400).json({ error: 'topics array is required' });
      return;
    }
    
    // Resolve language identifiers and basic field validation
    for (const t of topics) {
      if (!t.gb_category_id || !t.name || !t.slug || !t.language_id) {
        res.status(400).json({ error: 'Each topic must have gb_category_id, name, slug, and language_id' });
        return;
      }
      
      // Format and validate slug format (ensure no spaces, use hyphens)
      const slugError = validateSlugFormat(t.slug);
      if (slugError) {
        res.status(400).json({ error: `GB Topic slug validation failed: ${slugError}. Slug: "${t.slug}"` });
        return;
      }
      (t as any).slug = formatSlug(t.slug);
      const resolvedLang = await gbTopicService.resolveLanguageIdentifier((t as any).language_id?.toString());
      if (!resolvedLang) {
        res.status(400).json({ error: `Unable to resolve language_id: ${t.language_id}. Use ObjectId, code, or language name.` });
        return;
      }
      (t as any).language_id = resolvedLang;
      if ((t as any).supported_language_ids && Array.isArray((t as any).supported_language_ids)) {
        const resolved: string[] = [];
        for (const lid of (t as any).supported_language_ids) {
          const r = await gbTopicService.resolveLanguageIdentifier(lid.toString());
          if (r) resolved.push(r);
        }
        (t as any).supported_language_ids = resolved;
      }
      // Normalize types
      (t as any).order = typeof t.order === 'number' ? t.order : Number(t.order || 0);
      (t as any).is_published = !!t.is_published;
      (t as any).tag = Array.isArray(t.tag) ? t.tag : (t.tag ? [t.tag] : []);
    }
    
    // Validate all GB category IDs exist
    const categoryIds = topics.map(t => t.gb_category_id.toString());
    const { invalid: invalidCategories } = await gbTopicService.validateGBCategoryIds(categoryIds);
    
    if (invalidCategories.length > 0) {
      res.status(400).json({ 
        error: `Invalid gb_category_id(s) found: ${invalidCategories.join(', ')}. Please ensure all GB category IDs exist in the database.` 
      });
      return;
    }

    // Validate all language_ids exist
    const languageIds = topics.map(t => t.language_id.toString());
    const { invalid: invalidLanguages } = await gbTopicService.validateLanguageIds(languageIds);
    if (invalidLanguages.length > 0) {
      res.status(400).json({ error: `Invalid language_ids: ${invalidLanguages.join(', ')}` });
      return;
    }
    
    const created = await gbTopicService.bulkCreateGBTopics(topics);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getGBTopics = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { page, limit, gb_category_id, search, language_id } = req.query;
    
    if (page || limit || search) {
      const result = await gbTopicService.getGBTopicsWithPagination(
        Number(page || 1),
        Number(limit || 10),
        gb_category_id as string,
        search as string,
        language_id as string
      );
      res.status(200).json(result);
      return;
    }
    
    const topics = await gbTopicService.getAllGBTopics(gb_category_id as string, language_id as string);
    res.status(200).json(topics);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getGBTopic = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const topic = await gbTopicService.getGBTopicById(req.params.id);
    if (!topic) {
      res.status(404).json({ error: 'GB Topic not found' });
      return;
    }
    res.status(200).json(topic);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const updateGBTopic = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { slug, gb_category_id, order } = req.body;
    
    // Format and validate slug format if slug is being updated
    if (slug !== undefined) {
      const slugError = validateSlugFormat(slug);
      if (slugError) {
        res.status(400).json({ error: `GB Topic slug validation failed: ${slugError}. Slug: "${slug}"` });
        return;
      }
      (req.body as any).slug = formatSlug(slug);
    }
    
    // Allow duplicate slugs: removed duplicate slug checks
    
    // Check for duplicate order if order is being updated
    if (order !== undefined && gb_category_id) {
      const existingOrderTopic = await gbTopicService.checkDuplicateOrder(gb_category_id, order, req.params.id);
      if (existingOrderTopic) {
        res.status(409).json({ 
          error: `A GB Topic with order ${order} already exists for this GB category. Please use a different order number.` 
        });
        return;
      }
    }
    
    const updated = await gbTopicService.updateGBTopic(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ error: 'GB Topic not found' });
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

export const deleteGBTopic = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const deleted = await gbTopicService.deleteGBTopic(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: 'GB Topic not found' });
      return;
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

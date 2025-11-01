import { Request, Response } from 'express';
import * as gbSubtopicService from '../../services/content/gbSubtopic.service';
import { IGBSubtopic } from '@/types/content/gbSubtopic.types';
import { formatSlug, validateSlugFormat } from '../../utils/validators';

export const createGBSubtopic = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { gb_topic_id, name, slug, description, content, language_id, order, image, tag, source, author, is_published, created_by } = req.body;

    if (!gb_topic_id || !name || !slug || !language_id) {
      res.status(400).json({ error: 'Missing required fields: gb_topic_id, name, slug, language_id' });
      return;
    }

    // Format and validate slug format (ensure no spaces, use hyphens)
    const slugError = validateSlugFormat(slug);
    if (slugError) {
      res.status(400).json({ error: `GB Subtopic slug validation failed: ${slugError}. Slug: "${slug}"` });
      return;
    }
    const formattedSlug = formatSlug(slug);

    // Validate GB topic ID exists
    const { invalid: invalidTopics } = await gbSubtopicService.validateGBTopicIds([gb_topic_id.toString()]);
    if (invalidTopics.length > 0) {
      res.status(400).json({ 
        error: `Invalid gb_topic_id: ${gb_topic_id}. Please ensure the GB topic ID exists in the database.` 
      });
      return;
    }

    // Validate language_id exists
    const { invalid: invalidLanguages } = await gbSubtopicService.validateLanguageIds([language_id]);
    if (invalidLanguages.length > 0) {
      res.status(400).json({ error: `Invalid language_id: ${invalidLanguages.join(', ')}` });
      return;
    }

    // Allow duplicate slugs: removed duplicate slug checks

    // Check for duplicate order within GB topic
    const orderNum = typeof order === 'number' ? order : Number(order || 0);
    const existingOrderSubtopic = await gbSubtopicService.checkDuplicateOrder(gb_topic_id, orderNum);
    if (existingOrderSubtopic) {
      res.status(409).json({ 
        error: `A GB Subtopic with order ${orderNum} already exists for this GB topic. Please use a different order number.` 
      });
      return;
    }

    const subtopicData: IGBSubtopic = {
      gb_topic_id,
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
    } as IGBSubtopic;

    const created = await gbSubtopicService.createGBSubtopic(subtopicData);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Bulk create GB subtopics
export const bulkCreateGBSubtopics = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { subtopics } = req.body as { subtopics: IGBSubtopic[] };
    if (!Array.isArray(subtopics) || subtopics.length === 0) {
      res.status(400).json({ error: 'subtopics array is required' });
      return;
    }
    
    // Resolve language identifiers and basic field validation
    for (const s of subtopics) {
      if (!s.gb_topic_id || !s.name || !s.slug || !s.language_id) {
        res.status(400).json({ error: 'Each subtopic must have gb_topic_id, name, slug, and language_id' });
        return;
      }
      
      // Format and validate slug format (ensure no spaces, use hyphens)
      const slugError = validateSlugFormat(s.slug);
      if (slugError) {
        res.status(400).json({ error: `GB Subtopic slug validation failed: ${slugError}. Slug: "${s.slug}"` });
        return;
      }
      (s as any).slug = formatSlug(s.slug);
      const resolvedLang = await gbSubtopicService.resolveLanguageIdentifier((s as any).language_id?.toString());
      if (!resolvedLang) {
        res.status(400).json({ error: `Unable to resolve language_id: ${s.language_id}. Use ObjectId, code, or language name.` });
        return;
      }
      (s as any).language_id = resolvedLang;
      if ((s as any).supported_language_ids && Array.isArray((s as any).supported_language_ids)) {
        const resolved: string[] = [];
        for (const lid of (s as any).supported_language_ids) {
          const r = await gbSubtopicService.resolveLanguageIdentifier(lid.toString());
          if (r) resolved.push(r);
        }
        (s as any).supported_language_ids = resolved;
      }
      // Normalize types
      (s as any).order = typeof s.order === 'number' ? s.order : Number(s.order || 0);
      (s as any).is_published = !!s.is_published;
      (s as any).tag = Array.isArray(s.tag) ? s.tag : (s.tag ? [s.tag] : []);
    }
    
    // Validate all GB topic IDs exist
    const topicIds = subtopics.map(s => s.gb_topic_id.toString());
    const { invalid: invalidTopics } = await gbSubtopicService.validateGBTopicIds(topicIds);
    
    if (invalidTopics.length > 0) {
      res.status(400).json({ 
        error: `Invalid gb_topic_id(s) found: ${invalidTopics.join(', ')}. Please ensure all GB topic IDs exist in the database.` 
      });
      return;
    }

    // Validate all language_ids exist
    const languageIds = subtopics.map(s => s.language_id.toString());
    const { invalid: invalidLanguages } = await gbSubtopicService.validateLanguageIds(languageIds);
    if (invalidLanguages.length > 0) {
      res.status(400).json({ error: `Invalid language_ids: ${invalidLanguages.join(', ')}` });
      return;
    }
    
    const created = await gbSubtopicService.bulkCreateGBSubtopics(subtopics);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getGBSubtopics = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { page, limit, gb_topic_id, search, language_id } = req.query;
    
    if (page || limit || search) {
      const result = await gbSubtopicService.getGBSubtopicsWithPagination(
        Number(page || 1),
        Number(limit || 10),
        gb_topic_id as string,
        search as string,
        language_id as string
      );
      res.status(200).json(result);
      return;
    }
    
    const subtopics = await gbSubtopicService.getAllGBSubtopics(gb_topic_id as string, language_id as string);
    res.status(200).json(subtopics);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getGBSubtopic = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const subtopic = await gbSubtopicService.getGBSubtopicById(req.params.id);
    if (!subtopic) {
      res.status(404).json({ error: 'GB Subtopic not found' });
      return;
    }
    res.status(200).json(subtopic);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const updateGBSubtopic = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { slug, gb_topic_id, order } = req.body;
    
    // Format and validate slug format if slug is being updated
    if (slug !== undefined) {
      const slugError = validateSlugFormat(slug);
      if (slugError) {
        res.status(400).json({ error: `GB Subtopic slug validation failed: ${slugError}. Slug: "${slug}"` });
        return;
      }
      (req.body as any).slug = formatSlug(slug);
    }
    
    // Allow duplicate slugs: removed duplicate slug checks
    
    // Check for duplicate order if order is being updated
    if (order !== undefined && gb_topic_id) {
      const existingOrderSubtopic = await gbSubtopicService.checkDuplicateOrder(gb_topic_id, order, req.params.id);
      if (existingOrderSubtopic) {
        res.status(409).json({ 
          error: `A GB Subtopic with order ${order} already exists for this GB topic. Please use a different order number.` 
        });
        return;
      }
    }
    
    const updated = await gbSubtopicService.updateGBSubtopic(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ error: 'GB Subtopic not found' });
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

export const deleteGBSubtopic = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const deleted = await gbSubtopicService.deleteGBSubtopic(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: 'GB Subtopic not found' });
      return;
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

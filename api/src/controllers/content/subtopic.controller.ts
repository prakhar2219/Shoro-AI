import { Request, Response } from 'express';
import * as subtopicService from '../../services/content/subtopic.service';
import { formatSlug, validateSlugFormat } from '../../utils/validators';

export const createSubtopic = async (req: Request, res: Response) => {
  const { topic_id, language_id, title, slug, order, is_published, created_by, content, tag, source, author } = req.body;

  if (!topic_id || !language_id || !title || !slug) {
    res.status(400).json({ error: 'Missing required fields: topic_id, language_id, title, slug' });
    return;
  }

  // Format and validate slug format (ensure no spaces, use hyphens)
  const slugError = validateSlugFormat(slug);
  if (slugError) {
    res.status(400).json({ error: `Subtopic slug validation failed: ${slugError}. Slug: "${slug}"` });
    return;
  }
  const formattedSlug = formatSlug(slug);

  const finalOrder = typeof order === 'number' ? order : Number(order || 0);
  
  try {
    // Validate topic ID exists
    const topicValidation = await subtopicService.validateTopicIds([topic_id.toString()]);
    if (topicValidation.invalid.length > 0) {
      res.status(400).json({ 
        error: `Invalid topic_id: ${topic_id}. Please ensure the topic ID exists in the database.` 
      });
      return;
    }

    // Validate language ID exists
    const languageValidation = await subtopicService.validateLanguageIds([language_id.toString()]);
    if (languageValidation.invalid.length > 0) {
      res.status(400).json({ 
        error: `Invalid language_id: ${language_id}. Please ensure the language ID exists in the database.` 
      });
      return;
    }

    // Check for duplicate order within topic
    const existingSubtopic = await subtopicService.checkDuplicateOrder(topic_id, finalOrder);
    if (existingSubtopic) {
      res.status(409).json({ 
        error: `A subtopic with order ${finalOrder} already exists for this topic. Please use a different order number.` 
      });
      return;
    }
    
    const subtopic = {
      topic_id,
      language_id,
      title,
      slug: formattedSlug,
      content,
      order: finalOrder,
      is_published: !!is_published,
      created_by,
      tag,
      source,
      author,
    };

    const created = await subtopicService.createSubtopic(subtopic as any);
    res.status(201).json(created);
  } catch (e: any) {
    if (e.code === 11000 && e.keyPattern?.order) {
      res.status(400).json({ error: `Order ${finalOrder} already exists for this topic. Please use a different order number.` });
    } else {
      res.status(500).json({ error: e.message });
    }
  }
};

export const bulkCreateSubtopics = async (req: Request, res: Response) => {
  const { subtopics } = req.body as { subtopics: any[] };
  try {
    if (!Array.isArray(subtopics) || subtopics.length === 0) {
      res.status(400).json({ error: 'subtopics array is required' });
      return;
    }
    
    // Resolve language identifiers and normalize each subtopic
    for (const s of subtopics) {
      if (!s.topic_id || !s.language_id || !s.title || !s.slug) {
        res.status(400).json({ error: 'Each subtopic must have topic_id, language_id, title, and slug' });
        return;
      }
      
      // Format and validate slug format (ensure no spaces, use hyphens)
      const slugError = validateSlugFormat(s.slug);
      if (slugError) {
        res.status(400).json({ error: `Subtopic slug validation failed: ${slugError}. Slug: "${s.slug}"` });
        return;
      }
      (s as any).slug = formatSlug(s.slug);
      const resolvedLang = await subtopicService.resolveLanguageIdentifier(s.language_id.toString());
      if (!resolvedLang) {
        res.status(400).json({ error: `Unable to resolve language_id: ${s.language_id}. Use ObjectId, code, or language name.` });
        return;
      }
      s.language_id = resolvedLang;
      if (s.supported_language_ids && Array.isArray(s.supported_language_ids)) {
        const resolvedList: string[] = [];
        for (const lid of s.supported_language_ids) {
          const r = await subtopicService.resolveLanguageIdentifier(lid.toString());
          if (r) resolvedList.push(r);
        }
        s.supported_language_ids = resolvedList;
      }
      s.order = typeof s.order === 'number' ? s.order : Number(s.order || 0);
      s.is_published = !!s.is_published;
    }
    
    // Validate all topic IDs exist
    const topicIds = subtopics.map(s => s.topic_id.toString());
    const topicValidation = await subtopicService.validateTopicIds(topicIds);
    
    if (topicValidation.invalid.length > 0) {
      res.status(400).json({ 
        error: `Invalid topic_id(s) found: ${topicValidation.invalid.join(', ')}. Please ensure all topic IDs exist in the database.` 
      });
      return;
    }
    
    // Validate all language IDs exist
    const languageIds = subtopics.map(s => s.language_id.toString());
    const languageValidation = await subtopicService.validateLanguageIds(languageIds);
    
    if (languageValidation.invalid.length > 0) {
      res.status(400).json({ 
        error: `Invalid language_id(s) found: ${languageValidation.invalid.join(', ')}. Please ensure all language IDs exist in the database.` 
      });
      return;
    }
    
    const created = await subtopicService.bulkCreateSubtopics(subtopics);
    res.status(201).json(created);
  } catch (e: any) {
    if (e.code === 11000) {
      // Duplicate key error - likely duplicate order within same topic
      const duplicateInfo = e.writeErrors?.map((err: any) => {
        const failedDoc = subtopics[err.index];
        return `Row ${err.index + 1}: Order ${failedDoc?.order} already exists for topic_id ${failedDoc?.topic_id}`;
      }).join('; ') || 'Duplicate order numbers detected within the same topic';
      
      const successCount = e.insertedDocs?.length || Object.keys(e.insertedIds || {}).length || 0;
      res.status(207).json({ 
        message: `Partial success: ${successCount} subtopics created, ${subtopics.length - successCount} failed due to duplicate orders`,
        error: duplicateInfo,
        inserted: successCount,
        failed: subtopics.length - successCount
      });
    } else {
      res.status(500).json({ error: e.message });
    }
  }
};

export const getSubtopics = async (req: Request, res: Response) => {
  try {
    const rows = await subtopicService.getSubtopics(req.query.topic_id as string);
    res.status(200).json(rows);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};

export const getSubtopicsWithPagination = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const topic_id = req.query.topic_id as string | undefined;
    const search = req.query.search as string | undefined;
    const result = await subtopicService.getSubtopicsWithPagination(page, limit, topic_id, search);
    res.status(200).json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};

export const getSubtopic = async (req: Request, res: Response) => {
  try {
    const row = await subtopicService.getSubtopicById(req.params.id);
    if (!row) {
      res.status(404).json({ error: 'Subtopic not found' });
      return;
    }
    res.status(200).json(row);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};

export const updateSubtopic = async (req: Request, res: Response) => {
  try {
    // Format and validate slug format if slug is being updated
    if (req.body.slug !== undefined) {
      const slugError = validateSlugFormat(req.body.slug);
      if (slugError) {
        res.status(400).json({ error: `Subtopic slug validation failed: ${slugError}. Slug: "${req.body.slug}"` });
        return;
      }
      (req.body as any).slug = formatSlug(req.body.slug);
    }
    
    const row = await subtopicService.updateSubtopic(req.params.id, req.body);
    if (!row) {
      res.status(404).json({ error: 'Subtopic not found' });
      return;
    }
    res.status(200).json(row);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};

export const deleteSubtopic = async (req: Request, res: Response) => {
  try {
    const row = await subtopicService.deleteSubtopic(req.params.id);
    if (!row) {
      res.status(404).json({ error: 'Subtopic not found' });
      return;
    }
    res.status(204).send();
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};



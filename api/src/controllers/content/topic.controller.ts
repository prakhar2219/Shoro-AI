import { Request, Response } from 'express';
import * as topicService from '../../services/content/topic.service';
import { formatSlug, validateSlugFormat } from '../../utils/validators';

export const getTopicsIntegrity = async (_req: Request, res: Response) => {
  try {
    const issues = await topicService.findTopicReferenceIssues();
    res.status(200).json(issues);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};

export const createTopic = async (req: Request, res: Response) => {
  const { 
    chapter_id, 
    language_id, 
    supported_language_ids,
    title, 
    slug, 
    order, 
    is_published, 
    created_by, 
    content, 
    tag, 
    source, 
    author,
    flashcards,
    mock_test,
    total_questions,
    total_time,
    pass_questions,
    translations // New field for multilingual data
  } = req.body;
  
  if (!chapter_id || !language_id || !title || !slug) {
    res.status(400).json({ error: 'Missing required fields: chapter_id, language_id, title, slug' });
    return;
  }

  // Format and validate slug format (ensure no spaces, use hyphens)
  const slugError = validateSlugFormat(slug);
  if (slugError) {
    res.status(400).json({ error: `Topic slug validation failed: ${slugError}. Slug: "${slug}"` });
    return;
  }
  const formattedSlug = formatSlug(slug);

  const finalOrder = typeof order === 'number' ? order : Number(order || 0);
  
  try {
    // Validate chapter ID exists
    const chapterValidation = await topicService.validateChapterIds([chapter_id.toString()]);
    if (chapterValidation.invalid.length > 0) {
      res.status(400).json({ 
        error: `Invalid chapter_id: ${chapter_id}. Please ensure the chapter ID exists in the database.` 
      });
      return;
    }

    // Validate language ID exists
    const languageValidation = await topicService.validateLanguageIds([language_id.toString()]);
    if (languageValidation.invalid.length > 0) {
      res.status(400).json({ 
        error: `Invalid language_id: ${language_id}. Please ensure the language ID exists in the database.` 
      });
      return;
    }

    // Validate supported language IDs if provided
    if (supported_language_ids && Array.isArray(supported_language_ids) && supported_language_ids.length > 0) {
      const supportedLanguageValidation = await topicService.validateLanguageIds(supported_language_ids.map(id => id.toString()));
      if (supportedLanguageValidation.invalid.length > 0) {
        res.status(400).json({ 
          error: `Invalid supported_language_ids: ${supportedLanguageValidation.invalid.join(', ')}. Please ensure all language IDs exist in the database.` 
        });
        return;
      }
    }

    // Allow duplicate slugs: removed duplicate slug checks

    // Check for duplicate order within chapter
    const existingTopic = await topicService.checkDuplicateOrder(chapter_id, finalOrder);
    if (existingTopic) {
      res.status(409).json({ 
        error: `A topic with order ${finalOrder} already exists for this chapter. Please use a different order number.` 
      });
      return;
    }
    
    const topic = {
      chapter_id,
      language_id,
      supported_language_ids: supported_language_ids || [],
      title,
      slug: formattedSlug,
      content,
      order: finalOrder,
      is_published: !!is_published,
      created_by,
      tag,
      source,
      author,
      flashcards: flashcards ?? false,
      mock_test: mock_test ?? false,
      total_questions: total_questions ? parseInt(total_questions.toString()) : undefined,
      total_time: total_time ? parseInt(total_time.toString()) : undefined,
      pass_questions: pass_questions ? parseInt(pass_questions.toString()) : undefined,
    };

    const created = await topicService.createTopic(topic as any);
    
    // Handle translations if provided
    if (translations && Array.isArray(translations) && translations.length > 0) {
      try {
        for (const translation of translations) {
          if (translation.language_id && translation.title && translation.slug) {
            // Format and validate translation slug
            const transSlugError = validateSlugFormat(translation.slug);
            if (transSlugError) {
              // Skip translation with invalid slug - log but don't fail entire request
              continue;
            }
            const formattedTransSlug = formatSlug(translation.slug);
            
            await topicService.createTopicTranslation({
              topic_id: created._id,
              language_id: translation.language_id,
              title: translation.title,
              slug: formattedTransSlug,
              content: translation.content,
              translated_by_ai: translation.translated_by_ai || false,
              needs_review: translation.needs_review || false,
              updated_by: created_by
            } as any);
          }
        }
      } catch (translationError: any) {
        console.warn('Failed to create some translations:', translationError.message);
        // Don't fail the entire request if translations fail
      }
    }
    
    res.status(201).json(created);
  } catch (e: any) {
    if (e.code === 11000 && e.keyPattern?.order) {
      res.status(400).json({ error: `Order ${finalOrder} already exists for this chapter. Please use a different order number.` });
    } else {
      res.status(500).json({ error: e.message });
    }
  }
};

export const bulkCreateTopics = async (req: Request, res: Response) => {
  const { topics } = req.body as { topics: any[] };
  try {
    if (!Array.isArray(topics) || topics.length === 0) {
      res.status(400).json({ error: 'topics array is required' });
      return;
    }
    
    // Resolve language identifiers and normalize each topic
    for (const t of topics) {
      if (!t.chapter_id || !t.language_id || !t.title || !t.slug) {
        res.status(400).json({ error: 'Each topic must have chapter_id, language_id, title, and slug' });
        return;
      }
      
      // Format and validate slug format (ensure no spaces, use hyphens)
      const slugError = validateSlugFormat(t.slug);
      if (slugError) {
        res.status(400).json({ error: `Topic slug validation failed: ${slugError}. Slug: "${t.slug}"` });
        return;
      }
      (t as any).slug = formatSlug(t.slug);
      // Resolve language_id from id/code/name
      const resolvedLang = await topicService.resolveLanguageIdentifier(t.language_id.toString());
      if (!resolvedLang) {
        res.status(400).json({ error: `Unable to resolve language_id: ${t.language_id}. Use ObjectId, code (e.g. hi), or language name.` });
        return;
      }
      t.language_id = resolvedLang;
      // Resolve supported_language_ids if present
      if (t.supported_language_ids && Array.isArray(t.supported_language_ids)) {
        const resolvedList: string[] = [];
        for (const lid of t.supported_language_ids) {
          const r = await topicService.resolveLanguageIdentifier(lid.toString());
          if (r) resolvedList.push(r);
        }
        t.supported_language_ids = resolvedList;
      }
      t.order = typeof t.order === 'number' ? t.order : Number(t.order || 0);
      t.is_published = !!t.is_published;
    }
    
    // Validate all chapter IDs exist
    const chapterIds = topics.map(t => t.chapter_id.toString());
    const chapterValidation = await topicService.validateChapterIds(chapterIds);
    
    if (chapterValidation.invalid.length > 0) {
      res.status(400).json({ 
        error: `Invalid chapter_id(s) found: ${chapterValidation.invalid.join(', ')}. Please ensure all chapter IDs exist in the database.` 
      });
      return;
    }
    
    // Validate all language IDs exist
    const languageIds = topics.map(t => t.language_id.toString());
    const languageValidation = await topicService.validateLanguageIds(languageIds);
    
    if (languageValidation.invalid.length > 0) {
      res.status(400).json({ 
        error: `Invalid language_id(s) found: ${languageValidation.invalid.join(', ')}. Please ensure all language IDs exist in the database.` 
      });
      return;
    }
    
    const created = await topicService.bulkCreateTopics(topics);
    res.status(201).json(created);
  } catch (e: any) {
    if (e.code === 11000) {
      // Duplicate key error - likely duplicate order within same chapter
      const duplicateInfo = e.writeErrors?.map((err: any) => {
        const failedDoc = topics[err.index];
        return `Row ${err.index + 1}: Order ${failedDoc?.order} already exists for chapter_id ${failedDoc?.chapter_id}`;
      }).join('; ') || 'Duplicate order numbers detected within the same chapter';
      
      const successCount = e.insertedDocs?.length || Object.keys(e.insertedIds || {}).length || 0;
      res.status(207).json({ 
        message: `Partial success: ${successCount} topics created, ${topics.length - successCount} failed due to duplicate orders`,
        error: duplicateInfo,
        inserted: successCount,
        failed: topics.length - successCount
      });
    } else {
      res.status(500).json({ error: e.message });
    }
  }
};

export const getTopics = async (req: Request, res: Response) => {
  try {
    const rows = await topicService.getTopics(req.query.chapter_id as string);
    res.status(200).json(rows);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};

export const getTopicsWithPagination = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const chapter_id = req.query.chapter_id as string | undefined;
    const search = req.query.search as string | undefined;
    const result = await topicService.getTopicsWithPagination(page, limit, chapter_id, search);
    res.status(200).json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};

export const getTopic = async (req: Request, res: Response) => {
  try {
    const row = await topicService.getTopicById(req.params.id);
    if (!row) {
      res.status(404).json({ error: 'Topic not found' });
      return;
    }
    res.status(200).json(row);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};

export const updateTopic = async (req: Request, res: Response) => {
  try {
    const { slug, chapter_id, order } = req.body;
    
    // Format and validate slug format if slug is being updated
    if (slug !== undefined) {
      const slugError = validateSlugFormat(slug);
      if (slugError) {
        res.status(400).json({ error: `Topic slug validation failed: ${slugError}. Slug: "${slug}"` });
        return;
      }
      (req.body as any).slug = formatSlug(slug);
    }
    
    // Allow duplicate slugs: removed duplicate slug checks
    
    // Check for duplicate order if order is being updated
    if (order !== undefined && chapter_id) {
      const existingOrderTopic = await topicService.checkDuplicateOrder(chapter_id, order, req.params.id);
      if (existingOrderTopic) {
        res.status(409).json({ 
          error: `A topic with order ${order} already exists for this chapter. Please use a different order number.` 
        });
        return;
      }
    }
    
    const row = await topicService.updateTopic(req.params.id, req.body);
    if (!row) {
      res.status(404).json({ error: 'Topic not found' });
      return;
    }
    res.status(200).json(row);
  } catch (e: any) {
    if (e.code === 11000) {
      res.status(409).json({ error: 'Duplicate key error. Please check slug and order uniqueness.' });
    } else {
      res.status(500).json({ error: e.message });
    }
  }
};

export const deleteTopic = async (req: Request, res: Response) => {
  try {
    const row = await topicService.deleteTopic(req.params.id);
    if (!row) {
      res.status(404).json({ error: 'Topic not found' });
      return;
    }
    res.status(204).send();
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};

// Translation management endpoints
export const createTopicTranslation = async (req: Request, res: Response) => {
  try {
    const { topic_id, language_id, title, slug, content, translated_by_ai, needs_review, updated_by } = req.body;
    
    if (!topic_id || !language_id || !title || !slug) {
      res.status(400).json({ error: 'Missing required fields: topic_id, language_id, title, slug' });
      return;
    }
    
    // Format and validate slug format (ensure no spaces, use hyphens)
    const slugError = validateSlugFormat(slug);
    if (slugError) {
      res.status(400).json({ error: `Topic translation slug validation failed: ${slugError}. Slug: "${slug}"` });
      return;
    }
    const formattedSlug = formatSlug(slug);

    const translation = await topicService.createTopicTranslation({
      topic_id,
      language_id,
      title,
      slug: formattedSlug,
      content,
      translated_by_ai: translated_by_ai || false,
      needs_review: needs_review || false,
      updated_by
    });

    res.status(201).json(translation);
  } catch (e: any) {
    if (e.code === 11000) {
      res.status(409).json({ error: 'Translation already exists for this topic and language' });
    } else {
      res.status(500).json({ error: e.message });
    }
  }
};

export const updateTopicTranslation = async (req: Request, res: Response) => {
  try {
    const { topic_id, language_id } = req.params;
    const updateData = req.body;

    const translation = await topicService.updateTopicTranslation(topic_id, language_id, updateData);
    if (!translation) {
      res.status(404).json({ error: 'Translation not found' });
      return;
    }

    res.status(200).json(translation);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};

export const deleteTopicTranslation = async (req: Request, res: Response) => {
  try {
    const { topic_id, language_id } = req.params;

    const translation = await topicService.deleteTopicTranslation(topic_id, language_id);
    if (!translation) {
      res.status(404).json({ error: 'Translation not found' });
      return;
    }

    res.status(204).send();
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};

export const getTopicTranslations = async (req: Request, res: Response) => {
  try {
    const { topic_id } = req.params;
    const translations = await topicService.getTopicTranslations(topic_id);
    res.status(200).json(translations);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};

export const getTopicWithTranslations = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const topic = await topicService.getTopicWithTranslations(id);
    if (!topic) {
      res.status(404).json({ error: 'Topic not found' });
      return;
    }
    res.status(200).json(topic);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};



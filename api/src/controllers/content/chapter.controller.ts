// controllers/chapter.controller.ts
import { Request, Response } from 'express';
import * as chapterService from '../../services/content/chapter.service';
import { IChapter } from '@/types/content/chapter.types';
import ChapterTranslation from '../../models/content/chapterTranslation.model';
import { formatSlug, validateSlugFormat } from '../../utils/validators';

// Bulk create chapters
export const bulkCreateChapters = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { chapters } = req.body as { chapters: IChapter[] };
    if (!Array.isArray(chapters) || chapters.length === 0) {
      res.status(400).json({ error: 'chapters array is required' });
      return;
    }
    
    // Resolve identifiers (allow codes/names where supported) and basic validation
    for (const c of chapters) {
      if (!c.board_id || !c.class_id || !c.subject_id || !c.language_id || !c.title || !c.slug) {
        res.status(400).json({ error: 'Each chapter must have board_id, class_id, subject_id, language_id, title, and slug' });
        return;
      }
      
      // Format and validate slug format (ensure no spaces, use hyphens)
      const slugError = validateSlugFormat(c.slug);
      if (slugError) {
        res.status(400).json({ error: `Chapter slug validation failed: ${slugError}. Slug: "${c.slug}"` });
        return;
      }
      // Auto-format slug to ensure proper format
      (c as any).slug = formatSlug(c.slug);
      // Resolve board_id if not an ObjectId (accept short_code)
      const resolvedBoard = await chapterService.resolveBoardIdentifier((c.board_id as unknown as string));
      if (!resolvedBoard) {
        res.status(400).json({ error: `Unable to resolve board_id: ${c.board_id}. Use ObjectId or board short_code.` });
        return;
      }
      (c as any).board_id = resolvedBoard;
      // Resolve class_id if not an ObjectId (accept grade, optionally scoped by board)
      const resolvedClass = await chapterService.resolveClassIdentifier((c.class_id as unknown as string), resolvedBoard);
      if (!resolvedClass) {
        res.status(400).json({ error: `Unable to resolve class_id: ${c.class_id}. Use ObjectId or grade (optionally with board).` });
        return;
      }
      (c as any).class_id = resolvedClass;
      // Resolve subject_id if not an ObjectId (accept subject code, scoped by class)
      const resolvedSubject = await chapterService.resolveSubjectIdentifier((c.subject_id as unknown as string), resolvedClass);
      if (!resolvedSubject) {
        res.status(400).json({ error: `Unable to resolve subject_id: ${c.subject_id}. Use ObjectId or subject code (scoped by class).` });
        return;
      }
      (c as any).subject_id = resolvedSubject;
      // Resolve language_id if not an ObjectId
      const resolvedLang = await chapterService.resolveLanguageIdentifier(c.language_id as unknown as string);
      if (!resolvedLang) {
        res.status(400).json({ error: `Unable to resolve language_id: ${c.language_id}. Use ObjectId, code (e.g. hi), or language name.` });
        return;
      }
      (c as any).language_id = resolvedLang;
      // Resolve supported_language_ids if provided
      if ((c as any).supported_language_ids && Array.isArray((c as any).supported_language_ids)) {
        const resolvedList: string[] = [];
        for (const lid of (c as any).supported_language_ids) {
          const r = await chapterService.resolveLanguageIdentifier(lid.toString());
          if (r) resolvedList.push(r);
        }
        (c as any).supported_language_ids = resolvedList;
      }
      // Normalize types (temporary; may be reassigned after computing max orders)
      (c as any).order = typeof c.order === 'number' ? c.order : Number((c as any).order ?? NaN);
      (c as any).is_published = !!(c as any).is_published;
    }

    // Auto-assign unique order per subject+language when missing/invalid or duplicated in CSV batch
    // Note: Frontend handles auto-increment now, but this provides backend safety
    const scopeMap = new Map<string, number>(); // key: subjectId_languageId, value: nextOrder
    const usedOrdersInBatch: Map<string, Set<number>> = new Map();
    
    for (const c of chapters) {
      const sid = (c.subject_id as any).toString();
      const lid = (c.language_id as any).toString();
      const scopeKey = `${sid}_${lid}`;
      
      if (!usedOrdersInBatch.has(scopeKey)) {
        usedOrdersInBatch.set(scopeKey, new Set());
      }
      
      const orderNum = Number((c as any).order);
      const isValidOrder = Number.isInteger(orderNum) && orderNum >= 0 && !usedOrdersInBatch.get(scopeKey)!.has(orderNum);
      
      if (isValidOrder) {
        usedOrdersInBatch.get(scopeKey)!.add(orderNum);
        const currentMax = scopeMap.get(scopeKey) || 0;
        scopeMap.set(scopeKey, Math.max(currentMax, orderNum + 1));
      } else {
        // Auto-increment: get next available order for this scope
        const nextOrder = scopeMap.get(scopeKey) || 0;
        (c as any).order = nextOrder;
        usedOrdersInBatch.get(scopeKey)!.add(nextOrder);
        scopeMap.set(scopeKey, nextOrder + 1);
      }
    }
    
    // Validate all subject IDs exist
    const subjectIdsForValidation = chapters.map(c => c.subject_id.toString());
    const subjectValidation = await chapterService.validateSubjectIds(subjectIdsForValidation);
    
    if (subjectValidation.invalid.length > 0) {
      res.status(400).json({ 
        error: `Invalid subject_id(s) found: ${subjectValidation.invalid.join(', ')}. Please ensure all subject IDs exist in the database.` 
      });
      return;
    }
    
    // Validate all language IDs exist
    const languageIds = chapters.map(c => c.language_id.toString());
    const languageValidation = await chapterService.validateLanguageIds(languageIds);
    
    if (languageValidation.invalid.length > 0) {
      res.status(400).json({ 
        error: `Invalid language_id(s) found: ${languageValidation.invalid.join(', ')}. Please ensure all language IDs exist in the database.` 
      });
      return;
    }
    
    // Allow duplicate slugs: removed duplicate slug checks
    
    const result = await chapterService.bulkCreateChapters(chapters);
    
    // Enhanced error reporting
    if (result.failedCount > 0) {
      const errorMessages = result.failed.map(f => 
        `Row ${f.index + 1}: ${f.error}`
      ).join('; ');
      
      res.status(207).json({ // 207 Multi-Status for partial success
        insertedCount: result.insertedCount,
        failedCount: result.failedCount,
        attemptedCount: chapters.length,
        inserted: result.inserted,
        failures: result.failed,
        message: `${result.insertedCount} chapters inserted successfully, ${result.failedCount} failed. Errors: ${errorMessages}`
      });
    } else {
      res.status(201).json({
        insertedCount: result.insertedCount,
        attemptedCount: chapters.length,
        inserted: result.inserted
      });
    }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const createChapter = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { 
      board_id, 
      class_id, 
      subject_id, 
      language_id, 
      order, 
      is_published, 
      created_by, 
      title, 
      slug, 
      downloadNotes, 
      downloadPDF, 
      downloadQA, 
      content, 
      tag, 
      source, 
      author,
      flashcards,
      mock_test,
      total_questions,
      total_time,
      pass_questions
    } = req.body;

    if (!board_id || !class_id || !subject_id || !language_id || !title || !slug) {
      res.status(400).json({ error: 'Missing required fields: board_id, class_id, subject_id, language_id, title, slug' });
      return;
    }

    // Format and validate slug format (ensure no spaces, use hyphens)
    const slugError = validateSlugFormat(slug);
    if (slugError) {
      res.status(400).json({ error: `Chapter slug validation failed: ${slugError}. Slug: "${slug}"` });
      return;
    }
    const formattedSlug = formatSlug(slug);

    // Validate subject ID exists
    const subjectValidation = await chapterService.validateSubjectIds([subject_id.toString()]);
    if (subjectValidation.invalid.length > 0) {
      res.status(400).json({ 
        error: `Invalid subject_id: ${subject_id}. Please ensure the subject ID exists in the database.` 
      });
      return;
    }

    // Validate language ID exists
    const languageValidation = await chapterService.validateLanguageIds([language_id.toString()]);
    if (languageValidation.invalid.length > 0) {
      res.status(400).json({ 
        error: `Invalid language_id: ${language_id}. Please ensure the language ID exists in the database.` 
      });
      return;
    }

    // Allow duplicate slugs: removed duplicate slug checks

    // Check for duplicate order within subject
    const orderNum = typeof order === 'number' ? order : Number(order);
    const existingChapter = await chapterService.checkDuplicateOrder(subject_id, orderNum);
    if (existingChapter) {
      res.status(409).json({ 
        error: `A chapter with order ${orderNum} already exists for this subject. Please use a different order number.` 
      });
      return;
    }

    const chapter: IChapter = {
      board_id,
      class_id,
      subject_id,
      language_id,
      title,
      slug: formattedSlug,
      downloadNotes,
      downloadPDF,
      downloadQA,
      content,
      order: typeof order === 'number' ? order : Number(order),
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
    } as IChapter;

    const created = await chapterService.createChapter(chapter);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Paginated and filterable getChapters
export const getChapters = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      board_id, 
      class_id, 
      subject_id, 
      language_id,
      search,
      board_short_code,
      class_grade,
      subject_code
    } = req.query;
    
    // New functionality: Filter by human-readable identifiers
    if (board_short_code && class_grade && subject_code) {
      const chapters = await chapterService.getChaptersByBoardClassAndSubject(
        board_short_code as string,
        parseInt(class_grade as string),
        subject_code as string,
        language_id as string
      );
      res.status(200).json(chapters);
      return;
    }
    
    // Existing functionality: Filter by IDs
    if (page || limit || board_id || class_id || subject_id || language_id || search) {
      const result = await chapterService.getChaptersWithPagination(
        Number(page),
        Number(limit),
        board_id as string,
        class_id as string,
        subject_id as string,
        language_id as string,
        search as string
      );
      res.status(200).json(result);
      return;
    }
    // fallback to all chapters (legacy)
    const chapters = await chapterService.getAllChapters();
    res.status(200).json(chapters);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getChapter = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { language_id } = req.query;
    const chapter = await chapterService.getChapterById(req.params.id, language_id as string);
    if (!chapter) {
      res.status(404).json({ error: 'Chapter not found' });
      return;
    }
    res.status(200).json(chapter);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getChapterBySlug = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { board_short_code, class_grade, subject_code, chapter_slug, language_id } = req.query;
    
    if (!board_short_code || !class_grade || !subject_code || !chapter_slug) {
      res.status(400).json({ error: 'Missing required parameters: board_short_code, class_grade, subject_code, chapter_slug' });
      return;
    }

    const chapter = await chapterService.getChapterBySlug(
      board_short_code as string,
      parseInt(class_grade as string),
      subject_code as string,
      chapter_slug as string,
      language_id as string
    );

    if (!chapter) {
      res.status(404).json({ error: 'Chapter not found' });
      return;
    }

    res.status(200).json(chapter);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const updateChapter = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { slug, subject_id, language_id, order } = req.body;
    
    // Format and validate slug format if slug is being updated
    if (slug !== undefined) {
      const slugError = validateSlugFormat(slug);
      if (slugError) {
        res.status(400).json({ error: `Chapter slug validation failed: ${slugError}. Slug: "${slug}"` });
        return;
      }
      (req.body as any).slug = formatSlug(slug);
    }
    
    // Allow duplicate slugs: removed duplicate slug checks
    
    // Check for duplicate order if order is being updated
    if (order !== undefined && subject_id) {
      const existingOrderChapter = await chapterService.checkDuplicateOrder(subject_id, order, req.params.id);
      if (existingOrderChapter) {
        res.status(409).json({ 
          error: `A chapter with order ${order} already exists for this subject. Please use a different order number.` 
        });
        return;
      }
    }
    
    const updated = await chapterService.updateChapter(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Chapter not found' });
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

export const deleteChapter = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const deleted = await chapterService.deleteChapter(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: 'Chapter not found' });
      return;
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Add a translation to a chapter
export const addChapterTranslation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { language_id, title, slug, seo_title, seo_description, content, needs_review, translated_by_ai, updated_by } = req.body;
    if (!language_id || !title || !slug || !content) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }
    
    // Format and validate slug format (ensure no spaces, use hyphens)
    const slugError = validateSlugFormat(slug);
    if (slugError) {
      res.status(400).json({ error: `Chapter translation slug validation failed: ${slugError}. Slug: "${slug}"` });
      return;
    }
    const formattedSlug = formatSlug(slug);
    
    // Prevent duplicate translation for same chapter/language
    const exists = await ChapterTranslation.findOne({ chapter_id: id, language_id });
    if (exists) {
      res.status(409).json({ error: 'Translation already exists for this language.' });
      return;
    }
    const translation = new ChapterTranslation({
      chapter_id: id,
      language_id,
      title,
      slug: formattedSlug,
      seo_title,
      seo_description,
      content,
      needs_review,
      translated_by_ai,
      updated_by,
    });
    const created = await translation.save();
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Update a translation for a chapter
export const updateChapterTranslation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { translationId } = req.params;
    const update = req.body;
    const updated = await ChapterTranslation.findByIdAndUpdate(translationId, update, { new: true });
    if (!updated) {
      res.status(404).json({ error: 'Translation not found' });
      return;
    }
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Delete a translation for a chapter
export const deleteChapterTranslation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { translationId } = req.params;
    const deleted = await ChapterTranslation.findByIdAndDelete(translationId);
    if (!deleted) {
      res.status(404).json({ error: 'Translation not found' });
      return;
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

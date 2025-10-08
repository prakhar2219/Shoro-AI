// controllers/chapter.controller.ts
import { Request, Response } from 'express';
import * as chapterService from '../../services/content/chapter.service';
import { IChapter } from '@/types/content/chapter.types';
import ChapterTranslation from '../../models/content/chapterTranslation.model';

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
    for (const c of chapters) {
      if (!c.board_id || !c.class_id || !c.subject_id || !c.title || !c.slug) {
        res.status(400).json({ error: 'Each chapter must have board_id, class_id, subject_id, title, and slug' });
        return;
      }
      // Normalize types
      (c as any).order = typeof c.order === 'number' ? c.order : Number((c as any).order || 0);
      (c as any).is_published = !!(c as any).is_published;
    }
    const created = await chapterService.bulkCreateChapters(chapters);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const createChapter = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { board_id, class_id, subject_id, order, is_published, created_by, title, slug, content } = req.body;

    if (!board_id || !class_id || !subject_id || !title || !slug) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const chapter: IChapter = {
      board_id,
      class_id,
      subject_id,
      title,
      slug,
      content,
      order: typeof order === 'number' ? order : Number(order),
      is_published: !!is_published,
      created_by,
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
    if (page || limit || board_id || class_id || subject_id || language_id) {
      const result = await chapterService.getChaptersWithPagination(
        Number(page),
        Number(limit),
        board_id as string,
        class_id as string,
        subject_id as string,
        language_id as string
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
    const updated = await chapterService.updateChapter(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Chapter not found' });
      return;
    }
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
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
      slug,
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

import { Request, Response } from 'express';
import * as gbQuestionService from '../../services/content/gbQuestion.service';
import { IGBQuestion } from '@/types/content/gbQuestion.types';
import { formatSlug, validateSlugFormat } from '../../utils/validators';

export const createGBQuestion = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { gb_subtopic_id, question, slug, answer, content, language_id, order, image, tag, source, author, difficulty_level, is_published, created_by } = req.body;

    if (!gb_subtopic_id || !question || !slug || !language_id) {
      res.status(400).json({ error: 'Missing required fields: gb_subtopic_id, question, slug, language_id' });
      return;
    }

    // Format and validate slug format (ensure no spaces, use hyphens)
    const slugError = validateSlugFormat(slug);
    if (slugError) {
      res.status(400).json({ error: `GB Question slug validation failed: ${slugError}. Slug: "${slug}"` });
      return;
    }
    const formattedSlug = formatSlug(slug);

    // Validate GB subtopic ID exists
    const { invalid: invalidSubtopics } = await gbQuestionService.validateGBSubtopicIds([gb_subtopic_id.toString()]);
    if (invalidSubtopics.length > 0) {
      res.status(400).json({ 
        error: `Invalid gb_subtopic_id: ${gb_subtopic_id}. Please ensure the GB subtopic ID exists in the database.` 
      });
      return;
    }

    // Validate language_id exists
    const { invalid: invalidLanguages } = await gbQuestionService.validateLanguageIds([language_id]);
    if (invalidLanguages.length > 0) {
      res.status(400).json({ error: `Invalid language_id: ${invalidLanguages.join(', ')}` });
      return;
    }

    // Allow duplicate slugs: removed duplicate slug checks

    // Check for duplicate order within GB subtopic
    const orderNum = typeof order === 'number' ? order : Number(order || 0);
    const existingOrderQuestion = await gbQuestionService.checkDuplicateOrder(gb_subtopic_id, orderNum);
    if (existingOrderQuestion) {
      res.status(409).json({ 
        error: `A GB Question with order ${orderNum} already exists for this GB subtopic. Please use a different order number.` 
      });
      return;
    }

    const questionData: IGBQuestion = {
      gb_subtopic_id,
      question,
      slug: formattedSlug,
      answer,
      content,
      language_id,
      order: typeof order === 'number' ? order : Number(order || 0),
      image,
      tag: Array.isArray(tag) ? tag : (tag ? [tag] : []),
      source,
      author,
      difficulty_level: difficulty_level || 'medium',
      is_published: !!is_published,
      created_by,
    } as IGBQuestion;

    const created = await gbQuestionService.createGBQuestion(questionData);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Bulk create GB questions
export const bulkCreateGBQuestions = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { questions } = req.body as { questions: IGBQuestion[] };
    if (!Array.isArray(questions) || questions.length === 0) {
      res.status(400).json({ error: 'questions array is required' });
      return;
    }
    
    // Resolve language identifiers and basic field validation
    for (const q of questions) {
      if (!q.gb_subtopic_id || !q.question || !q.slug || !q.language_id) {
        res.status(400).json({ error: 'Each question must have gb_subtopic_id, question, slug, and language_id' });
        return;
      }
      
      // Format and validate slug format (ensure no spaces, use hyphens)
      const slugError = validateSlugFormat(q.slug);
      if (slugError) {
        res.status(400).json({ error: `GB Question slug validation failed: ${slugError}. Slug: "${q.slug}"` });
        return;
      }
      (q as any).slug = formatSlug(q.slug);
      const resolvedLang = await gbQuestionService.resolveLanguageIdentifier((q as any).language_id?.toString());
      if (!resolvedLang) {
        res.status(400).json({ error: `Unable to resolve language_id: ${q.language_id}. Use ObjectId, code, or language name.` });
        return;
      }
      (q as any).language_id = resolvedLang;
      // Normalize types
      (q as any).order = typeof q.order === 'number' ? q.order : Number(q.order || 0);
      (q as any).is_published = !!q.is_published;
      (q as any).tag = Array.isArray(q.tag) ? q.tag : (q.tag ? [q.tag] : []);
      (q as any).difficulty_level = q.difficulty_level || 'medium';
    }
    
    // Validate all GB subtopic IDs exist
    const subtopicIds = questions.map(q => q.gb_subtopic_id.toString());
    const { invalid: invalidSubtopics } = await gbQuestionService.validateGBSubtopicIds(subtopicIds);
    
    if (invalidSubtopics.length > 0) {
      res.status(400).json({ 
        error: `Invalid gb_subtopic_id(s) found: ${invalidSubtopics.join(', ')}. Please ensure all GB subtopic IDs exist in the database.` 
      });
      return;
    }

    // Validate all language_ids exist
    const languageIds = questions.map(q => q.language_id.toString());
    const { invalid: invalidLanguages } = await gbQuestionService.validateLanguageIds(languageIds);
    if (invalidLanguages.length > 0) {
      res.status(400).json({ error: `Invalid language_ids: ${invalidLanguages.join(', ')}` });
      return;
    }
    
    const created = await gbQuestionService.bulkCreateGBQuestions(questions);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getGBQuestions = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { page, limit, gb_subtopic_id, search, language_id, difficulty_level } = req.query;
    
    if (page || limit || search || difficulty_level) {
      const result = await gbQuestionService.getGBQuestionsWithPagination(
        Number(page || 1),
        Number(limit || 10),
        gb_subtopic_id as string,
        search as string,
        language_id as string,
        difficulty_level as string
      );
      res.status(200).json(result);
      return;
    }
    
    const questions = await gbQuestionService.getAllGBQuestions(gb_subtopic_id as string, language_id as string);
    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getGBQuestion = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const question = await gbQuestionService.getGBQuestionById(req.params.id);
    if (!question) {
      res.status(404).json({ error: 'GB Question not found' });
      return;
    }
    res.status(200).json(question);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const updateGBQuestion = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { slug, gb_subtopic_id, order } = req.body;
    
    // Format and validate slug format if slug is being updated
    if (slug !== undefined) {
      const slugError = validateSlugFormat(slug);
      if (slugError) {
        res.status(400).json({ error: `GB Question slug validation failed: ${slugError}. Slug: "${slug}"` });
        return;
      }
      (req.body as any).slug = formatSlug(slug);
    }
    
    // Allow duplicate slugs: removed duplicate slug checks
    
    // Check for duplicate order if order is being updated
    if (order !== undefined && gb_subtopic_id) {
      const existingOrderQuestion = await gbQuestionService.checkDuplicateOrder(gb_subtopic_id, order, req.params.id);
      if (existingOrderQuestion) {
        res.status(409).json({ 
          error: `A GB Question with order ${order} already exists for this GB subtopic. Please use a different order number.` 
        });
        return;
      }
    }
    
    const updated = await gbQuestionService.updateGBQuestion(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ error: 'GB Question not found' });
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

export const deleteGBQuestion = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const deleted = await gbQuestionService.deleteGBQuestion(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: 'GB Question not found' });
      return;
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

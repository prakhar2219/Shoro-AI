import { Request, Response } from 'express';
import * as descriptiveQuestionService from '../../services/content/descriptiveQuestion.service';
import { resolveLanguageIdentifier } from '../../services/content/chapter.service';
import { IDescriptiveQuestion } from '@/types/content/descriptiveQuestion.types';
import DescriptiveQuestionTranslation from '../../models/content/descriptiveQuestionTranslation.model';
import { IDescriptiveQuestionTranslation } from '@/types/content/descriptiveQuestionTranslation.types';

// Bulk create descriptive questions
export const bulkCreateDescriptiveQuestions = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { descriptive_questions } = req.body as { descriptive_questions: IDescriptiveQuestion[] };
    if (!Array.isArray(descriptive_questions) || descriptive_questions.length === 0) {
      res.status(400).json({ error: 'descriptive_questions array is required' });
      return;
    }
    for (const q of descriptive_questions) {
      if (!q.entity_type || !q.entity_id || !q.question || !q.answer) {
        res.status(400).json({ error: 'Each item must have entity_type, entity_id, question, and answer' });
        return;
      }
      // Resolve supported_language_ids if provided
      if ((q as any).supported_language_ids && Array.isArray((q as any).supported_language_ids)) {
        const resolvedList: string[] = [];
        for (const lid of (q as any).supported_language_ids) {
          const r = await resolveLanguageIdentifier(lid.toString());
          if (r) resolvedList.push(r);
        }
        (q as any).supported_language_ids = resolvedList;
      }
    }
    const created = await descriptiveQuestionService.bulkCreateDescriptiveQuestions(descriptive_questions);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const createDescriptiveQuestion = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      entity_type,
      entity_id,
      question,
      answer,
      difficulty,
      tags,
      content,
      author,
      source,
    } = req.body;

    if (!entity_type || !entity_id || !question || !answer) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const descriptiveQuestion: IDescriptiveQuestion = {
      entity_type,
      entity_id,
      question,
      answer,
      difficulty: difficulty || 'medium',
      tags: Array.isArray(tags) ? tags : [],
      content,
      author,
      source,
    } as IDescriptiveQuestion;

    const created = await descriptiveQuestionService.createDescriptiveQuestion(descriptiveQuestion);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getDescriptiveQuestions = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { entity_type, entity_id } = req.query;
    const questions = await descriptiveQuestionService.getAllDescriptiveQuestions(
      entity_type as string,
      entity_id as string
    );
    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getDescriptiveQuestion = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { language_id } = req.query;
    const question = await descriptiveQuestionService.getDescriptiveQuestionById(req.params.id, language_id as string);
    if (!question) {
      res.status(404).json({ error: 'Descriptive question not found' });
      return;
    }
    res.status(200).json(question);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const updateDescriptiveQuestion = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const updated = await descriptiveQuestionService.updateDescriptiveQuestion(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Descriptive question not found' });
      return;
    }
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const deleteDescriptiveQuestion = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const deleted = await descriptiveQuestionService.deleteDescriptiveQuestion(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: 'Descriptive question not found' });
      return;
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getDescriptiveQuestionsWithPagination = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { page = 1, limit = 10, search, entity_type, entity_id, language_id } = req.query;
    const result = await descriptiveQuestionService.getDescriptiveQuestionsWithPagination(
      Number(page),
      Number(limit),
      search as string,
      entity_type as string,
      entity_id as string,
      language_id as string
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Descriptive Question Translation CRUD
export const createDescriptiveQuestionTranslation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { questionId } = req.params;
    const {
      language_id,
      question,
      answer,
      translated_by_ai,
      needs_review,
      updated_by,
      content,
    } = req.body;

    if (!language_id || !question || !answer || !content) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const translation: IDescriptiveQuestionTranslation = {
      descriptive_question_id: questionId as any,
      language_id,
      question,
      answer,
      translated_by_ai,
      needs_review,
      updated_by,
      content,
    } as IDescriptiveQuestionTranslation;

    const created = await descriptiveQuestionService.createDescriptiveQuestionTranslation(questionId, translation);
    res.status(201).json(created);
  } catch (error: any) {
    if (error.message && error.message.includes('Translation already exists')) {
      res.status(409).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

export const updateDescriptiveQuestionTranslation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { translationId } = req.params;
    const updated = await descriptiveQuestionService.updateDescriptiveQuestionTranslation(translationId, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Translation not found' });
      return;
    }
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const deleteDescriptiveQuestionTranslation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { translationId } = req.params;
    const deleted = await descriptiveQuestionService.deleteDescriptiveQuestionTranslation(translationId);
    if (!deleted) {
      res.status(404).json({ error: 'Translation not found' });
      return;
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getDescriptiveQuestionTranslations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { questionId } = req.params;
    const translations = await descriptiveQuestionService.getDescriptiveQuestionTranslations(questionId);
    res.status(200).json(translations);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}; 
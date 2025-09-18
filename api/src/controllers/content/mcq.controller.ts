import { Request, Response } from 'express';
import * as mcqService from '../../services/content/mcq.service';
import { IMCQ } from '@/types/content/mcq.types';
import MCQTranslation from '../../models/content/mcqTranslation.model';
import { IMCQTranslation } from '@/types/content/mcqTranslation.types';

// Bulk create MCQs
export const bulkCreateMCQs = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { mcqs } = req.body as { mcqs: IMCQ[] };
    if (!Array.isArray(mcqs) || mcqs.length === 0) {
      res.status(400).json({ error: 'mcqs array is required' });
      return;
    }
    for (const m of mcqs) {
      if (!m.entity_type || !m.entity_id || !m.question || !m.options || !m.correct_answer || !m.content) {
        res.status(400).json({ error: 'Each MCQ must have entity_type, entity_id, question, options, correct_answer, content' });
        return;
      }
      if (!Array.isArray((m as any).options) || (m as any).options.length < 2) {
        res.status(400).json({ error: 'Each MCQ must have at least 2 options' });
        return;
      }
    }
    const created = await mcqService.bulkCreateMCQs(mcqs);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const createMCQ = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      entity_type,
      entity_id,
      question,
      options,
      correct_answer,
      explanation,
      difficulty,
      tags,
      content,
    } = req.body;

    if (!entity_type || !entity_id || !question || !options || !correct_answer || !content) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Validate options structure
    if (!Array.isArray(options) || options.length < 2) {
      res.status(400).json({ error: 'At least 2 options are required' });
      return;
    }

    // Validate correct_answer is one of the option keys
    const optionKeys = options.map(opt => opt.key);
    if (!optionKeys.includes(correct_answer)) {
      res.status(400).json({ error: 'Correct answer must be one of the option keys' });
      return;
    }

    const mcq: IMCQ = {
      entity_type,
      entity_id,
      question,
      options,
      correct_answer,
      explanation,
      difficulty: difficulty || 'medium',
      tags: Array.isArray(tags) ? tags : [],
      content,
    } as IMCQ;

    const created = await mcqService.createMCQ(mcq);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getMCQs = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { entity_type, entity_id } = req.query;
    const mcqs = await mcqService.getAllMCQs(
      entity_type as string,
      entity_id as string
    );
    res.status(200).json(mcqs);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getMCQ = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { language_id } = req.query;
    const mcq = await mcqService.getMCQById(req.params.id, language_id as string);
    if (!mcq) {
      res.status(404).json({ error: 'MCQ not found' });
      return;
    }
    res.status(200).json(mcq);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const updateMCQ = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const updated = await mcqService.updateMCQ(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ error: 'MCQ not found' });
      return;
    }
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const deleteMCQ = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const deleted = await mcqService.deleteMCQ(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: 'MCQ not found' });
      return;
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getMCQsWithPagination = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { page = 1, limit = 10, search, entity_type, entity_id, language_id } = req.query;
    const result = await mcqService.getMCQsWithPagination(
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

// MCQ Translation CRUD
export const createMCQTranslation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { mcqId } = req.params;
    const {
      language_id,
      question,
      options,
      correct_answer,
      explanation,
      translated_by_ai,
      needs_review,
      updated_by,
      content,
    } = req.body;

    if (!language_id || !question || !options || !correct_answer || !content) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const translation: IMCQTranslation = {
      mcq_id: mcqId as any,
      language_id,
      question,
      options,
      correct_answer,
      explanation,
      translated_by_ai,
      needs_review,
      updated_by,
      content,
    } as IMCQTranslation;

    const created = await mcqService.createMCQTranslation(mcqId, translation);
    res.status(201).json(created);
  } catch (error: any) {
    if (error.message && error.message.includes('Translation already exists')) {
      res.status(409).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

export const updateMCQTranslation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { translationId } = req.params;
    const updated = await mcqService.updateMCQTranslation(translationId, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Translation not found' });
      return;
    }
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const deleteMCQTranslation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { translationId } = req.params;
    const deleted = await mcqService.deleteMCQTranslation(translationId);
    if (!deleted) {
      res.status(404).json({ error: 'Translation not found' });
      return;
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getMCQTranslations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { mcqId } = req.params;
    const translations = await mcqService.getMCQTranslations(mcqId);
    res.status(200).json(translations);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}; 
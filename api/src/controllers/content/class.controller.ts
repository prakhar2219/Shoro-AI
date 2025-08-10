import { Request, Response } from 'express';
import * as classService from '../../services/content/class.service';
import { IClass } from '@/types/content/class.types';

export const createClass = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { board_id, number, name, grade, content } = req.body;

    if (!board_id || typeof grade !== 'number' || !name || !content) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const classData: IClass = {
      board_id,
      name,
      grade,
      content,
    } as IClass;

    const created = await classService.createClass(classData);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getClasses = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const language_id = req.query.language_id as string | undefined;
    const board_short_code = req.query.board_short_code as string | undefined;
    
    if (board_short_code) {
      // New functionality: Get classes by board short code
      const classes = await classService.getClassesByBoardShortCode(board_short_code, language_id);
      res.status(200).json(classes);
    } else {
      // Existing functionality: Get all classes
      const classes = await classService.getAllClasses(language_id);
      res.status(200).json(classes);
    }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getClass = async (req: Request, res: Response): Promise<void> => {
  try {
    const language_id = req.query.language_id as string | undefined;
    const foundClass = await classService.getClassById(
      req.params.id,
      language_id
    );
    if (!foundClass) {
      res.status(404).json({ error: 'Class not found' });
      return;
    }
    res.status(200).json(foundClass);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const updateClass = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const updated = await classService.updateClass(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Class not found' });
      return;
    }
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const deleteClass = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const deleted = await classService.deleteClass(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: 'Class not found' });
      return;
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Paginated classes
export const getClassesWithPagination = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { page = '1', limit = '10', search, language_id } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const result = await classService.getClassesWithPagination(
      pageNum,
      limitNum,
      search as string,
      language_id as string
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Class Translation CRUD
export const getClassTranslations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const translations = await classService.getClassTranslations(id);
    res.status(200).json(translations);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const createClassTranslation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { language_id, name, content, translated_by_ai, needs_review, updated_by } = req.body;
    if (!language_id || !name || !content) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }
    const translation = {
      language_id,
      name,
      content,
      translated_by_ai,
      needs_review,
      updated_by,
    };
    const created = await classService.createClassTranslation(id, translation);
    res.status(201).json(created);
  } catch (error: any) {
    if (error.message && error.message.includes('Translation already exists')) {
      res.status(409).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

export const updateClassTranslation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { translationId } = req.params;
    const update = req.body;
    const updated = await classService.updateClassTranslation(translationId, update);
    if (!updated) {
      res.status(404).json({ error: 'Translation not found' });
      return;
    }
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const deleteClassTranslation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { translationId } = req.params;
    const deleted = await classService.deleteClassTranslation(translationId);
    if (!deleted) {
      res.status(404).json({ error: 'Translation not found' });
      return;
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getClassesByBoard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { board_id } = req.params;
    const classes = await classService.getClassesByBoard(board_id);
    res.status(200).json(classes);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

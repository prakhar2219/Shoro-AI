import { Request, Response } from 'express';
import * as subjectService from '../../services/content/subject.service';
import { ISubject } from '@/types/content/subject.types';

export const createSubject = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { class_id, code, icon, name, content } = req.body;

    if (!class_id || !code || !name || !content) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const subject: ISubject = {
      class_id,
      code,
      icon,
      name,
      content,
    } as ISubject;

    const created = await subjectService.createSubject(subject);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getSubjects = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const language_id = req.query.language_id as string | undefined;
    const subjects = await subjectService.getAllSubjects(language_id);
    res.status(200).json(subjects);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getSubject = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const language_id = req.query.language_id as string | undefined;
    const subject = await subjectService.getSubjectById(
      req.params.id,
      language_id
    );
    if (!subject) {
      res.status(404).json({ error: 'Subject not found' });
      return;
    }
    res.status(200).json(subject);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const updateSubject = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const updated = await subjectService.updateSubject(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Subject not found' });
      return;
    }
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const deleteSubject = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const deleted = await subjectService.deleteSubject(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: 'Subject not found' });
      return;
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Paginated subjects
export const getSubjectsWithPagination = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { page = '1', limit = '10', search, language_id } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const result = await subjectService.getSubjectsWithPagination(
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

// Subject Translation CRUD
export const getSubjectTranslations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const translations = await subjectService.getSubjectTranslations(id);
    res.status(200).json(translations);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const createSubjectTranslation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { language_id, name, translated_by_ai, needs_review, updated_by } = req.body;
    if (!language_id || !name) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }
    const translation = {
      language_id,
      name,
      translated_by_ai,
      needs_review,
      updated_by,
    };
    const created = await subjectService.createSubjectTranslation(id, translation);
    res.status(201).json(created);
  } catch (error: any) {
    if (error.message && error.message.includes('Translation already exists')) {
      res.status(409).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

export const updateSubjectTranslation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { translationId } = req.params;
    const update = req.body;
    const updated = await subjectService.updateSubjectTranslation(translationId, update);
    if (!updated) {
      res.status(404).json({ error: 'Translation not found' });
      return;
    }
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const deleteSubjectTranslation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { translationId } = req.params;
    const deleted = await subjectService.deleteSubjectTranslation(translationId);
    if (!deleted) {
      res.status(404).json({ error: 'Translation not found' });
      return;
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

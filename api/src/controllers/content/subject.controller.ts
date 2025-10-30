import { Request, Response } from 'express';
import * as subjectService from '../../services/content/subject.service';
import { ISubject } from '@/types/content/subject.types';

// Bulk create subjects
export const bulkCreateSubjects = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { subjects } = req.body as { subjects: ISubject[] };
    if (!Array.isArray(subjects) || subjects.length === 0) {
      res.status(400).json({ error: 'subjects array is required' });
      return;
    }
    // Resolve language identifiers and basic field validation
    for (const s of subjects) {
      if (!s.class_id || !s.language_id || !s.code || !s.name) {
        res.status(400).json({ error: 'Each subject must have class_id, language_id, code, and name' });
        return;
      }
      const resolvedLang = await subjectService.resolveLanguageIdentifier((s as any).language_id?.toString());
      if (!resolvedLang) {
        res.status(400).json({ error: `Unable to resolve language_id: ${s.language_id}. Use ObjectId, code, or language name.` });
        return;
      }
      (s as any).language_id = resolvedLang;
      if ((s as any).supported_language_ids && Array.isArray((s as any).supported_language_ids)) {
        const resolved: string[] = [];
        for (const lid of (s as any).supported_language_ids) {
          const r = await subjectService.resolveLanguageIdentifier(lid.toString());
          if (r) resolved.push(r);
        }
        (s as any).supported_language_ids = resolved;
      }
    }
    
    // Validate all class IDs exist
    const classIds = subjects.map(s => s.class_id.toString());
    const classValidation = await subjectService.validateClassIds(classIds);
    
    if (classValidation.invalid.length > 0) {
      res.status(400).json({ 
        error: `Invalid class_id(s) found: ${classValidation.invalid.join(', ')}. Please ensure all class IDs exist in the database.` 
      });
      return;
    }
    
    // Validate all language IDs exist
    const languageIds = subjects.map(s => s.language_id.toString());
    const languageValidation = await subjectService.validateLanguageIds(languageIds);
    
    if (languageValidation.invalid.length > 0) {
      res.status(400).json({ 
        error: `Invalid language_id(s) found: ${languageValidation.invalid.join(', ')}. Please ensure all language IDs exist in the database.` 
      });
      return;
    }
    
    const created = await subjectService.bulkCreateSubjects(subjects);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const createSubject = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { class_id, language_id, code, icon, name, downloadNotes, downloadPDF, downloadQA, content, tag, source, author } = req.body;

    if (!class_id || !language_id || !code || !name) {
      res.status(400).json({ error: 'Missing required fields: class_id, language_id, code, name' });
      return;
    }

    // Validate class ID exists
    const classValidation = await subjectService.validateClassIds([class_id.toString()]);
    if (classValidation.invalid.length > 0) {
      res.status(400).json({ 
        error: `Invalid class_id: ${class_id}. Please ensure the class ID exists in the database.` 
      });
      return;
    }

    // Validate language ID exists
    const languageValidation = await subjectService.validateLanguageIds([language_id.toString()]);
    if (languageValidation.invalid.length > 0) {
      res.status(400).json({ 
        error: `Invalid language_id: ${language_id}. Please ensure the language ID exists in the database.` 
      });
      return;
    }

    // Check for duplicate: class_id + code + language_id combination
    const existingSubject = await subjectService.checkDuplicateSubject(class_id, code, language_id);
    if (existingSubject) {
      res.status(409).json({ 
        error: `A subject with code "${code}" already exists for this class and language. Please use a different code or update the existing subject.` 
      });
      return;
    }

    const subject: ISubject = {
      class_id,
      language_id,
      code,
      icon,
      name,
      downloadNotes,
      downloadPDF,
      downloadQA,
      content,
      tag,
      source,
      author,
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
    const board_short_code = req.query.board_short_code as string | undefined;
    const class_grade = req.query.class_grade as string | undefined;
    
    if (board_short_code && class_grade) {
      // New functionality: Get subjects by board and class grade
      const subjects = await subjectService.getSubjectsByBoardAndClass(board_short_code, parseInt(class_grade), language_id);
      res.status(200).json(subjects);
    } else {
      // Existing functionality: Get all subjects
      const subjects = await subjectService.getAllSubjects(language_id);
      res.status(200).json(subjects);
    }
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

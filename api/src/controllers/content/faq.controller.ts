import { Request, Response } from 'express';
import * as faqService from '../../services/content/faq.service';
import { IFAQ } from '@/types/content/faq.types';
import FAQTranslation from '../../models/content/faqTranslation.model';
import { IFAQTranslation } from '@/types/content/faqTranslation.types';

// Bulk create FAQs
export const bulkCreateFAQs = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { faqs } = req.body as { faqs: IFAQ[] };
    if (!Array.isArray(faqs) || faqs.length === 0) {
      res.status(400).json({ error: 'faqs array is required' });
      return;
    }
    for (const f of faqs) {
      if (!f.entity_type || !f.entity_id || !f.question || !f.answer || !f.content) {
        res.status(400).json({ error: 'Each FAQ must have entity_type, entity_id, question, answer, content' });
        return;
      }
      (f as any).order = typeof (f as any).order === 'number' ? (f as any).order : Number((f as any).order || 0);
    }
    const created = await faqService.bulkCreateFAQs(faqs);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const createFAQ = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      entity_type,
      entity_id,
      question,
      answer,
      category,
      order,
      content,
    } = req.body;

    if (!entity_type || !entity_id || !question || !answer || !content) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const faq: IFAQ = {
      entity_type,
      entity_id,
      question,
      answer,
      category,
      order: order || 0,
      content,
    } as IFAQ;

    const created = await faqService.createFAQ(faq);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getFAQs = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { entity_type, entity_id } = req.query;
    const faqs = await faqService.getAllFAQs(
      entity_type as string,
      entity_id as string
    );
    res.status(200).json(faqs);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getFAQ = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { language_id } = req.query;
    const faq = await faqService.getFAQById(req.params.id, language_id as string);
    if (!faq) {
      res.status(404).json({ error: 'FAQ not found' });
      return;
    }
    res.status(200).json(faq);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const updateFAQ = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const updated = await faqService.updateFAQ(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ error: 'FAQ not found' });
      return;
    }
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const deleteFAQ = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const deleted = await faqService.deleteFAQ(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: 'FAQ not found' });
      return;
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getFAQsWithPagination = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { page = 1, limit = 10, search, entity_type, entity_id, language_id } = req.query;
    const result = await faqService.getFAQsWithPagination(
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

// FAQ Translation CRUD
export const createFAQTranslation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { faqId } = req.params;
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

    const translation: IFAQTranslation = {
      faq_id: faqId as any,
      language_id,
      question,
      answer,
      translated_by_ai,
      needs_review,
      updated_by,
      content,
    } as IFAQTranslation;

    const created = await faqService.createFAQTranslation(faqId, translation);
    res.status(201).json(created);
  } catch (error: any) {
    if (error.message && error.message.includes('Translation already exists')) {
      res.status(409).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

export const updateFAQTranslation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { translationId } = req.params;
    const updated = await faqService.updateFAQTranslation(translationId, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Translation not found' });
      return;
    }
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const deleteFAQTranslation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { translationId } = req.params;
    const deleted = await faqService.deleteFAQTranslation(translationId);
    if (!deleted) {
      res.status(404).json({ error: 'Translation not found' });
      return;
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getFAQTranslations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { faqId } = req.params;
    const translations = await faqService.getFAQTranslations(faqId);
    res.status(200).json(translations);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}; 
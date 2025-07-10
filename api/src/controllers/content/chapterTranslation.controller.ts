import { Request, Response } from 'express';
import * as translationService from '../../services/content/chapterTranslation.service';
import { IChapterTranslation } from '@/types/content/chapterTranslation.types';

export const createChapterTranslation = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const data: IChapterTranslation = req.body;
    if (
      !data.chapter_id ||
      !data.language_id ||
      !data.title ||
      !data.slug ||
      !data.content
    ) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }
    const created = await translationService.createChapterTranslation(data);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getChapterTranslations = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const data = await translationService.getAllChapterTranslations();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getChapterTranslation = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const item = await translationService.getChapterTranslationBySlug(
      req.params.slug
    );
    if (!item) {
      res.status(404).json({ error: 'Translation not found' });
      return;
    }
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const updateChapterTranslation = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const updated = await translationService.updateChapterTranslation(
      req.params.slug,
      req.body
    );
    if (!updated) {
      res.status(404).json({ error: 'Translation not found' });
      return;
    }
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const deleteChapterTranslation = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const deleted = await translationService.deleteChapterTranslation(
      req.params.slug
    );
    if (!deleted) {
      res.status(404).json({ error: 'Translation not found' });
      return;
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// controllers/chapter.controller.ts
import { Request, Response } from 'express';
import * as chapterService from '../../services/content/chapter.service';
import { IChapter } from '@/types/content/chapter.types';

export const createChapter = async (req: Request, res: Response): Promise<void> => {
    try {
        const { subject_id, order, is_published, created_by } = req.body;

        if (!subject_id || typeof order !== 'number' || !created_by) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }

        const chapter: IChapter = {
            subject_id,
            order,
            is_published: !!is_published,
            created_by,
        } as IChapter;

        const created = await chapterService.createChapter(chapter);
        res.status(201).json(created);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

export const getChapters = async (_req: Request, res: Response): Promise<void> => {
    try {
        const chapters = await chapterService.getAllChapters();
        res.status(200).json(chapters);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

export const getChapter = async (req: Request, res: Response): Promise<void> => {
    try {
        const chapter = await chapterService.getChapterById(req.params.id);
        if (!chapter) {
            res.status(404).json({ error: 'Chapter not found' });
            return;
        }
        res.status(200).json(chapter);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

export const updateChapter = async (req: Request, res: Response): Promise<void> => {
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

export const deleteChapter = async (req: Request, res: Response): Promise<void> => {
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

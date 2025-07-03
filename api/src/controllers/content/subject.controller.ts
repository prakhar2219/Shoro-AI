import { Request, Response } from 'express';
import * as subjectService from '../../services/content/subject.service';
import { ISubject } from '@/types/content/subject.types';

export const createSubject = async (req: Request, res: Response): Promise<void> => {
    try {
        const { class_id, code, icon } = req.body;

        if (!class_id || !code) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }

        const subject: ISubject = {
            class_id,
            code,
            icon,
        } as ISubject;

        const created = await subjectService.createSubject(subject);
        res.status(201).json(created);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

export const getSubjects = async (_req: Request, res: Response): Promise<void> => {
    try {
        const subjects = await subjectService.getAllSubjects();
        res.status(200).json(subjects);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

export const getSubject = async (req: Request, res: Response): Promise<void> => {
    try {
        const subject = await subjectService.getSubjectById(req.params.id);
        if (!subject) {
            res.status(404).json({ error: 'Subject not found' });
            return;
        }
        res.status(200).json(subject);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

export const updateSubject = async (req: Request, res: Response): Promise<void> => {
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

export const deleteSubject = async (req: Request, res: Response): Promise<void> => {
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
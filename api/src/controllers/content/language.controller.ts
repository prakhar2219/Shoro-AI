import { Request, Response } from 'express';
import * as languageService from '../../services/content/language.service';
import { ILanguage } from '../../types/content/language.types';

export const createLanguage = async (req: Request, res: Response): Promise<void> => {
    try {
        const { code, name, native_name, direction, locale, script, ai_supported } = req.body;
        if (!code || !name || !native_name) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }

        const language: ILanguage = {
            code,
            name,
            native_name,
            direction: direction || 'ltr',
            locale,
            script,
            ai_supported: typeof ai_supported === 'boolean' ? ai_supported : true,
        } as ILanguage;

        const created = await languageService.createLanguage(language);
        res.status(201).json(created);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

export const getLanguages = async (_req: Request, res: Response): Promise<void> => {
    try {
        const languages = await languageService.getAllLanguages();
        res.status(200).json(languages);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

export const getLanguage = async (req: Request, res: Response): Promise<void> => {
    try {
        const language = await languageService.getLanguageByCode(req.params.code);
        if (!language) {
            res.status(404).json({ error: 'Language not found' });
            return;
        }
        res.status(200).json(language);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

export const updateLanguage = async (req: Request, res: Response): Promise<void> => {
    try {
        const updated = await languageService.updateLanguage(req.params.code, req.body);
        if (!updated) {
            res.status(404).json({ error: 'Language not found' });
            return;
        }
        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

export const deleteLanguage = async (req: Request, res: Response): Promise<void> => {
    try {
        const deleted = await languageService.deleteLanguage(req.params.code);
        if (!deleted) {
            res.status(404).json({ error: 'Language not found' });
            return;
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

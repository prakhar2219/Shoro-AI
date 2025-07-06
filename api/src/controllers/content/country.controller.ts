import { Request, Response } from 'express';
import * as countryService from '../../services/content/country.service';
import { ICountry } from '@/types/content/country.types';

export const createCountry = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, code, default_language_id, supported_language_ids } = req.body;

        if (!name || !code || !default_language_id) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }

        const country: ICountry = {
            name,
            code,
            default_language_id,
            supported_language_ids: Array.isArray(supported_language_ids) ? supported_language_ids : [],
        } as ICountry;

        const created = await countryService.createCountry(country);
        res.status(201).json(created);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

export const getCountries = async (req: Request, res: Response): Promise<void> => {
    try {
        const language_id = req.query.language_id as string | undefined;
        const countries = await countryService.getAllCountries(language_id);
        res.status(200).json(countries);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

export const getCountry = async (req: Request, res: Response): Promise<void> => {
    try {
        const language_id = req.query.language_id as string | undefined;
        const country = await countryService.getCountryByCode(req.params.code, language_id);
        if (!country) {
            res.status(404).json({ error: 'Country not found' });
            return;
        }
        res.status(200).json(country);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

export const updateCountry = async (req: Request, res: Response): Promise<void> => {
    try {
        const updated = await countryService.updateCountry(req.params.code, req.body);
        if (!updated) {
            res.status(404).json({ error: 'Country not found' });
            return;
        }
        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

export const deleteCountry = async (req: Request, res: Response): Promise<void> => {
    try {
        const deleted = await countryService.deleteCountry(req.params.code);
        if (!deleted) {
            res.status(404).json({ error: 'Country not found' });
            return;
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

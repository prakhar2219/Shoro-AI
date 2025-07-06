import { Request, Response } from 'express';
import * as classService from '../../services/content/class.service';
import { IClass } from '@/types/content/class.types';

export const createClass = async (req: Request, res: Response): Promise<void> => {
  try {
    const { board_id, number, name } = req.body;

    if (!board_id || typeof number !== 'number' || !name) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const classData: IClass = {
      board_id,
      number,
      name,
    } as IClass;

    const created = await classService.createClass(classData);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getClasses = async (req: Request, res: Response): Promise<void> => {
  try {
    const language_id = req.query.language_id as string | undefined;
    const classes = await classService.getAllClasses(language_id);
    res.status(200).json(classes);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getClass = async (req: Request, res: Response): Promise<void> => {
  try {
    const language_id = req.query.language_id as string | undefined;
    const foundClass = await classService.getClassById(req.params.id, language_id);
    if (!foundClass) {
      res.status(404).json({ error: 'Class not found' });
      return;
    }
    res.status(200).json(foundClass);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const updateClass = async (req: Request, res: Response): Promise<void> => {
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

export const deleteClass = async (req: Request, res: Response): Promise<void> => {
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

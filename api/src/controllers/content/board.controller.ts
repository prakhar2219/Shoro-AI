import { Request, Response } from 'express';
import * as boardService from '../../services/content/board.service';
import { IBoard } from '../../types/content/board.types';

export const createBoard = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      name,
      short_code,
      country_id,
      default_language_id,
      supported_language_ids,
      description,
      logo_url,
    } = req.body;

    if (!name || !short_code || !country_id || !default_language_id) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const board: IBoard = {
      name,
      short_code,
      country_id,
      default_language_id,
      supported_language_ids: Array.isArray(supported_language_ids)
        ? supported_language_ids
        : [],
      description,
      logo_url,
    } as IBoard;

    const created = await boardService.createBoard(board);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getBoards = async (req: Request, res: Response): Promise<void> => {
  try {
    const language_id = req.query.language_id as string | undefined;
    const boards = await boardService.getAllBoards(language_id);
    res.status(200).json(boards);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getBoard = async (req: Request, res: Response): Promise<void> => {
  try {
    const language_id = req.query.language_id as string | undefined;
    const board = await boardService.getBoardByCode(
      req.params.short_code,
      language_id
    );
    if (!board) {
      res.status(404).json({ error: 'Board not found' });
      return;
    }
    res.status(200).json(board);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const updateBoard = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const updated = await boardService.updateBoard(
      req.params.short_code,
      req.body
    );
    if (!updated) {
      res.status(404).json({ error: 'Board not found' });
      return;
    }
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const deleteBoard = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const deleted = await boardService.deleteBoard(req.params.short_code);
    if (!deleted) {
      res.status(404).json({ error: 'Board not found' });
      return;
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

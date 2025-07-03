import Board from '../../models/content/board.model';
import { IBoard } from '@/types/content/board.types';

export const createBoard = async (data: IBoard) => {
    return await Board.create(data);
};

export const getAllBoards = async () => {
    return await Board.find()
        .populate('country_id')
        .populate('default_language_id')
        .populate('supported_language_ids')
        .sort({ createdAt: -1 });
};

export const getBoardByCode = async (short_code: string) => {
    return await Board.findOne({ short_code })
        .populate('country_id')
        .populate('default_language_id')
        .populate('supported_language_ids');
};

export const updateBoard = async (short_code: string, data: Partial<IBoard>) => {
    return await Board.findOneAndUpdate({ short_code }, data, { new: true });
};

export const deleteBoard = async (short_code: string) => {
    return await Board.findOneAndDelete({ short_code });
};
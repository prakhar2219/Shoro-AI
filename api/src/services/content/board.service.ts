import Board from '../../models/content/board.model';
import BoardTranslation from '../../models/content/boardTranslation.model';
import { IBoard } from '@/types/content/board.types';

export const createBoard = async (data: IBoard) => {
  return await Board.create(data);
};

export const getAllBoards = async (language_id?: string) => {
  const boards = await Board.find()
    .populate('country_id')
    .populate('default_language_id')
    .populate('supported_language_ids')
    .sort({ createdAt: -1 });

  // Attach translation for each board
  const boardsWithTranslations = await Promise.all(
    boards.map(async (board: any) => {
      let translation = null;
      if (language_id) {
        translation = await BoardTranslation.findOne({
          board_id: board._id,
          language_id,
        });
      }
      if (!translation) {
        translation = await BoardTranslation.findOne({ board_id: board._id });
      }
      return {
        ...board.toObject(),
        name: translation?.name || board.name,
        description: translation?.description || board.description,
        translation,
      };
    })
  );
  return boardsWithTranslations;
};

export const getBoardByCode = async (
  short_code: string,
  language_id?: string
) => {
  const board = await Board.findOne({ short_code })
    .populate('country_id')
    .populate('default_language_id')
    .populate('supported_language_ids');
  if (!board) return null;
  let translation = null;
  if (language_id) {
    translation = await BoardTranslation.findOne({
      board_id: board._id,
      language_id,
    });
  }
  if (!translation) {
    translation = await BoardTranslation.findOne({ board_id: board._id });
  }
  return {
    ...board.toObject(),
    name: translation?.name || board.name,
    description: translation?.description || board.description,
    translation,
  };
};

export const updateBoard = async (
  short_code: string,
  data: Partial<IBoard>
) => {
  return await Board.findOneAndUpdate({ short_code }, data, { new: true });
};

export const deleteBoard = async (short_code: string) => {
  return await Board.findOneAndDelete({ short_code });
};

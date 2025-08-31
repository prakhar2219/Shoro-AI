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
        name: board.name,
        description: board.description,
        translation,
      };
    })
  );
  return boardsWithTranslations;
};

export const getBoardsByCountry = async (country_code: string, language_id?: string) => {
  const boards = await Board.find()
    .populate({
      path: 'country_id',
      match: { code: country_code }
    })
    .populate('default_language_id')
    .populate('supported_language_ids')
    .sort({ createdAt: -1 });

  // Filter boards that have the specified country
  const filteredBoards = boards.filter((board: any) => board.country_id);

  // Attach translation for each board
  const boardsWithTranslations = await Promise.all(
    filteredBoards.map(async (board: any) => {
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
        name: board.name,
        description: board.description,
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

// Paginated boards with all translations
export const getBoardsWithPagination = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
  language_id?: string
) => {
  const skip = (page - 1) * limit;
  const filter: any = {};
  if (search) {
    const searchRegex = new RegExp(search, 'i');
    filter.$or = [
      { name: searchRegex },
      { short_code: searchRegex },
    ];
  }
  const [boards, total] = await Promise.all([
    Board.find(filter)
      .populate('country_id')
      .populate('default_language_id')
      .populate('supported_language_ids')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Board.countDocuments(filter)
  ]);

  // Fetch all translations for all boards in one query
  const boardIds = boards.map((b: any) => b._id);
  const allTranslations = await BoardTranslation.find({ board_id: { $in: boardIds } });

  const boardsWithTranslations = boards.map((board: any) => {
    let translation = null;
    if (language_id) {
      translation = allTranslations.find(
        (t: any) => t.board_id.toString() === board._id.toString() && t.language_id.toString() === language_id
      );
    }
    if (!translation) {
      translation = allTranslations.find((t: any) => t.board_id.toString() === board._id.toString());
    }
    // All translations for this board
    const translations = allTranslations.filter((t: any) => t.board_id.toString() === board._id.toString());
    return {
      ...board.toObject(),
      // name: translation?.name || board.name,
      name: board.name,
      // description: translation?.description || board.description,
      description: board.description,
      translation,
      translations,
    };
  });
  return {
    data: boardsWithTranslations,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
};

// Board Translation CRUD
export const getBoardTranslations = async (short_code: string) => {
  const board = await Board.findOne({ short_code });
  if (!board) return [];
  return await BoardTranslation.find({ board_id: board._id });
};

export const createBoardTranslation = async (short_code: string, data: any) => {
  const board = await Board.findOne({ short_code });
  if (!board) throw new Error('Board not found');
  // Prevent duplicate translation for same board/language
  const exists = await BoardTranslation.findOne({ board_id: board._id, language_id: data.language_id });
  if (exists) throw new Error('Translation already exists for this language.');
  return await BoardTranslation.create({ ...data, board_id: board._id });
};

export const updateBoardTranslation = async (translationId: string, data: any) => {
  return await BoardTranslation.findByIdAndUpdate(translationId, data, { new: true });
};

export const deleteBoardTranslation = async (translationId: string) => {
  return await BoardTranslation.findByIdAndDelete(translationId);
};

export default {
  createBoard,
  getAllBoards,
  getBoardsByCountry,
  getBoardByCode,
  updateBoard,
  deleteBoard,
  getBoardsWithPagination,
  getBoardTranslations,
  createBoardTranslation,
  updateBoardTranslation,
  deleteBoardTranslation,
};

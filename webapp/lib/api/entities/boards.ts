import { api } from '../axios';
import { API_ENDPOINTS } from '../endpoints';
import { getCookie } from '../../utils/cookie';

// Types
export interface IBoard {
  _id?: string;
  name: string;
  short_code: string;
  country_id: string | { _id: string; name: string; code: string; [key: string]: any };
  default_language_id: string | { _id: string; name: string; code: string; [key: string]: any };
  supported_language_ids: (string | { _id: string; name: string; code: string; [key: string]: any })[];
  description?: string;
  logo_url?: string;
  translation?: IBoardTranslation;
  translations?: IBoardTranslation[];
  createdAt?: string;
  updatedAt?: string;
}

export interface IBoardTranslation {
  _id?: string;
  board_id: string;
  language_id: string;
  name: string;
  description?: string;
  translated_by_ai?: boolean;
  needs_review?: boolean;
  updated_by?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Paginated fetch
export const getBoardsWithPagination = async (page = 1, limit = 15, search = '', language_id?: string) => {
  const params: any = { page, limit };
  if (search) params.search = search;
  if (language_id) params.language_id = language_id;
  const res = await api.get(`${API_ENDPOINTS.boards}/paginated`, { params });
  return res.data;
};

export const getBoards = async (language_id?: string): Promise<IBoard[]> => {
  const params = language_id ? { language_id } : undefined;
  const res = await api.get(API_ENDPOINTS.boards, { params });
  return res.data;
};

export const getBoardsByCountry = async (country_code: string, language_id?: string): Promise<IBoard[]> => {
  const params: any = { country_code };
  if (language_id) params.language_id = language_id;
  const res = await api.get(API_ENDPOINTS.boards, { params });
  return res.data;
};

export const getBoard = async (short_code: string, language_id?: string): Promise<IBoard> => {
  const params = language_id ? { language_id } : undefined;
  const res = await api.get(`${API_ENDPOINTS.boards}/${short_code}`, { params });
  return res.data;
};

export const createBoard = async (data: Partial<IBoard>) => {
  const res = await api.post(API_ENDPOINTS.boards, data);
  return res.data;
};

export const updateBoard = async (short_code: string, data: Partial<IBoard>) => {
  const res = await api.put(`${API_ENDPOINTS.boards}/${short_code}`, data);
  return res.data;
};

export const deleteBoard = async (short_code: string) => {
  const res = await api.delete(`${API_ENDPOINTS.boards}/${short_code}`);
  return res.data;
};

// Board Translation API
export const getBoardTranslations = async (short_code: string): Promise<IBoardTranslation[]> => {
  const res = await api.get(`${API_ENDPOINTS.boards}/${short_code}/translations`);
  return res.data;
};

export const createBoardTranslation = async (short_code: string, data: Partial<IBoardTranslation>) => {
  const res = await api.post(`${API_ENDPOINTS.boards}/${short_code}/translations`, data);
  return res.data;
};

export const updateBoardTranslation = async (short_code: string, translationId: string, data: Partial<IBoardTranslation>) => {
  const res = await api.put(`${API_ENDPOINTS.boards}/${short_code}/translations/${translationId}`, data);
  return res.data;
};

export const deleteBoardTranslation = async (short_code: string, translationId: string) => {
  const res = await api.delete(`${API_ENDPOINTS.boards}/${short_code}/translations/${translationId}`);
  return res.data;
};
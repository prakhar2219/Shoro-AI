import { api } from '../axios';
import { API_ENDPOINTS } from '../endpoints';
import { getCookie } from '../../utils/cookie';

// Types
export interface IClass {
  _id?: string;
  name: string;
  grade: number;
  board_id: string | { _id: string; name: string; short_code: string; [key: string]: any };
  description?: string;
  age_range?: string;
  content?: any[];
  translation?: IClassTranslation;
  translations?: IClassTranslation[];
  createdAt?: string;
  updatedAt?: string;
}

export interface IClassTranslation {
  _id?: string;
  class_id: string;
  language_id: string;
  name: string;
  translated_by_ai?: boolean;
  needs_review?: boolean;
  updated_by?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Paginated fetch
export const getClassesWithPagination = async (page = 1, limit = 15, search = '', language_id?: string) => {
  const params: any = { page, limit };
  if (search) params.search = search;
  if (language_id) params.language_id = language_id;
  const res = await api.get(`${API_ENDPOINTS.classes}/paginated`, { params });
  return res.data;
};

export const getClasses = async (language_id?: string): Promise<IClass[]> => {
  const params = language_id ? { language_id } : undefined;
  const res = await api.get(API_ENDPOINTS.classes, { params });
  return res.data;
};

export const getClass = async (id: string, language_id?: string): Promise<IClass> => {
  const params = language_id ? { language_id } : undefined;
  const res = await api.get(`${API_ENDPOINTS.classes}/${id}`, { params });
  return res.data;
};

export const createClass = async (data: Partial<IClass>) => {
  const res = await api.post(API_ENDPOINTS.classes, data);
  return res.data;
};

export const updateClass = async (id: string, data: Partial<IClass>) => {
  const res = await api.put(`${API_ENDPOINTS.classes}/${id}`, data);
  return res.data;
};

export const deleteClass = async (id: string) => {
  const res = await api.delete(`${API_ENDPOINTS.classes}/${id}`);
  return res.data;
};

// Class Translation API
export const getClassTranslations = async (id: string): Promise<IClassTranslation[]> => {
  const res = await api.get(`${API_ENDPOINTS.classes}/${id}/translations`);
  return res.data;
};

export const createClassTranslation = async (id: string, data: Partial<IClassTranslation>) => {
  const res = await api.post(`${API_ENDPOINTS.classes}/${id}/translations`, data);
  return res.data;
};

export const updateClassTranslation = async (id: string, translationId: string, data: Partial<IClassTranslation>) => {
  const res = await api.put(`${API_ENDPOINTS.classes}/${id}/translations/${translationId}`, data);
  return res.data;
};

export const deleteClassTranslation = async (id: string, translationId: string) => {
  const res = await api.delete(`${API_ENDPOINTS.classes}/${id}/translations/${translationId}`);
  return res.data;
};

export const getClassesByBoard = async (board_id: string): Promise<IClass[]> => {
  const res = await api.get(`${API_ENDPOINTS.classes}/by-board/${board_id}`);
  return res.data;
};

export const getClassesByBoardShortCode = async (board_short_code: string, language_id?: string): Promise<IClass[]> => {
  const params: any = { board_short_code };
  if (language_id) params.language_id = language_id;
  const res = await api.get(API_ENDPOINTS.classes, { params });
  return res.data;
};
import { api } from '../axios';
import { API_ENDPOINTS } from '../endpoints';
import { getCookie } from '../../utils/cookie';

// Types
export interface ISubject {
  _id?: string;
  name: string;
  code: string;
  icon?: string;
  class_id: string | { _id: string; name: string; grade: number; [key: string]: any };
  language_id: string | { _id: string; name: string; code: string; [key: string]: any };
  content?: any[];
  translation?: ISubjectTranslation;
  translations?: ISubjectTranslation[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ISubjectTranslation {
  _id?: string;
  subject_id: string;
  language_id: string;
  name: string;
  translated_by_ai?: boolean;
  needs_review?: boolean;
  updated_by?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Paginated fetch
export const getSubjectsWithPagination = async (page = 1, limit = 15, search = '', language_id?: string) => {
  const params: any = { page, limit };
  if (search) params.search = search;
  if (language_id) params.language_id = language_id;
  const res = await api.get(`${API_ENDPOINTS.subjects}/paginated`, { params });
  return res.data;
};

export const getSubjects = async (language_id?: string): Promise<ISubject[]> => {
  // Only pass language_id if explicitly provided
  const params = language_id ? { language_id } : undefined;
  const res = await api.get(API_ENDPOINTS.subjects, { params });
  return res.data;
};

export const getSubjectsByBoardAndClass = async (board_short_code: string, class_grade: number, language_id?: string): Promise<ISubject[]> => {
  const params: any = { board_short_code, class_grade };
  if (language_id) params.language_id = language_id;
  const res = await api.get(API_ENDPOINTS.subjects, { params });
  return res.data;
};

export const getSubject = async (id: string, language_id?: string): Promise<ISubject> => {
  const params = language_id ? { language_id } : undefined;
  const res = await api.get(`${API_ENDPOINTS.subjects}/${id}`, { params });
  return res.data;
};

export const createSubject = async (data: Partial<ISubject>) => {
  const res = await api.post(API_ENDPOINTS.subjects, data);
  return res.data;
};

export const updateSubject = async (id: string, data: Partial<ISubject>) => {
  const res = await api.put(`${API_ENDPOINTS.subjects}/${id}`, data);
  return res.data;
};

export const deleteSubject = async (id: string) => {
  const res = await api.delete(`${API_ENDPOINTS.subjects}/${id}`);
  return res.data;
};

// Bulk create subjects
export const bulkCreateSubjects = async (subjects: Partial<ISubject>[]) => {
  const res = await api.post(`${API_ENDPOINTS.subjects}/bulk`, { subjects });
  return res.data;
};

// Subject Translation API
export const getSubjectTranslations = async (id: string): Promise<ISubjectTranslation[]> => {
  const res = await api.get(`${API_ENDPOINTS.subjects}/${id}/translations`);
  return res.data;
};

export const createSubjectTranslation = async (id: string, data: Partial<ISubjectTranslation>) => {
  const res = await api.post(`${API_ENDPOINTS.subjects}/${id}/translations`, data);
  return res.data;
};

export const updateSubjectTranslation = async (id: string, translationId: string, data: Partial<ISubjectTranslation>) => {
  const res = await api.put(`${API_ENDPOINTS.subjects}/${id}/translations/${translationId}`, data);
  return res.data;
};

export const deleteSubjectTranslation = async (id: string, translationId: string) => {
  const res = await api.delete(`${API_ENDPOINTS.subjects}/${id}/translations/${translationId}`);
  return res.data;
};
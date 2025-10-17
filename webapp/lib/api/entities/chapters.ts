import { api } from '../axios';
import { API_ENDPOINTS } from '../endpoints';

export interface IChapter {
  _id: string;
  board_id: string | { _id: string; name: string; grade: number; [key: string]: any };
  class_id: string | { _id: string; name: string; grade: number; [key: string]: any };
  subject_id: string | { _id: string; name: string; grade: number; [key: string]: any };
  language_id: string | { _id: string; name: string; code: string; [key: string]: any };
  order: number;
  is_published: boolean;
  created_by: string;
  title: string;
  slug: string;
  seo_title?: string;
  seo_description?: string;
  content: any[];
  version?: number;
  translation?: any;
  translations?: any[];
}

export const getChapters = async ({ page = 1, limit = 10, search = '', subject_id = '', board_id = '', class_id = '' } = {}) => {
    const params: any = { page, limit };
    if (search) params.search = search;
    if (subject_id) params.subject_id = subject_id;
    if (board_id) params.board_id = board_id;
    if (class_id) params.class_id = class_id;
    const res = await api.get(API_ENDPOINTS.chapters, { params });
    return res.data;
};

export const getChaptersByBoardClassAndSubject = async (board_short_code: string, class_grade: number, subject_code: string, language_id?: string) => {
    const params: any = { board_short_code, class_grade, subject_code };
    if (language_id) params.language_id = language_id;
    const res = await api.get(API_ENDPOINTS.chapters, { params });
    return res.data;
};

export const getChapterBySlug = async (board_short_code: string, class_grade: number, subject_code: string, chapter_slug: string, language_id?: string) => {
    const params: any = { board_short_code, class_grade, subject_code, chapter_slug };
    if (language_id) params.language_id = language_id;
    const res = await api.get(`${API_ENDPOINTS.chapters}/by-slug`, { params });
    return res.data;
};

export const createChapter = async (data: any) => {
    const res = await api.post(API_ENDPOINTS.chapters, data);
    return res.data;
};

export const updateChapter = async (id: string, data: any) => {
    const res = await api.put(`${API_ENDPOINTS.chapters}/${id}`, data);
    return res.data;
};

export const deleteChapter = async (id: string) => {
    const res = await api.delete(`${API_ENDPOINTS.chapters}/${id}`);
    return res.data;
};

// Bulk create chapters
export const bulkCreateChapters = async (chapters: any[]) => {
    const res = await api.post(`${API_ENDPOINTS.chapters}/bulk`, { chapters });
    return res.data;
};
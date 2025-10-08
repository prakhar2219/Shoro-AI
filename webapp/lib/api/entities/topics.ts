import { api } from '../axios';
import { API_ENDPOINTS } from '../endpoints';

export interface ITopic {
  _id?: string;
  chapter_id: string | { _id: string; title: string };
  title: string;
  slug: string;
  order?: number;
  is_published?: boolean;
  content?: string; // HTML string like chapters
  createdAt?: string;
  updatedAt?: string;
  translation?: any;
  translations?: any[];
}

export const getTopicsWithPagination = async (
  page = 1,
  limit = 10,
  chapter_id?: string
) => {
  const params: any = { page, limit };
  if (chapter_id) params.chapter_id = chapter_id;
  const res = await api.get(`${API_ENDPOINTS.topics}/paginated`, { params });
  return res.data;
};

export const getTopics = async (chapter_id?: string): Promise<ITopic[]> => {
  const params: any = {};
  if (chapter_id) params.chapter_id = chapter_id;
  const res = await api.get(API_ENDPOINTS.topics, { params });
  return res.data;
};

export const createTopic = async (data: Partial<ITopic>) => {
  const res = await api.post(API_ENDPOINTS.topics, data);
  return res.data;
};

export const updateTopic = async (id: string, data: Partial<ITopic>) => {
  const res = await api.put(`${API_ENDPOINTS.topics}/${id}`, data);
  return res.data;
};

export const deleteTopic = async (id: string) => {
  const res = await api.delete(`${API_ENDPOINTS.topics}/${id}`);
  return res.data;
};

export const bulkCreateTopics = async (rows: Partial<ITopic>[]) => {
  const res = await api.post(`${API_ENDPOINTS.topics}/bulk`, { topics: rows });
  return res.data;
};



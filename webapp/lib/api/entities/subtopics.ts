import { api } from '../axios';
import { API_ENDPOINTS } from '../endpoints';

export interface ISubtopic {
  _id?: string;
  topic_id: string | { _id: string; title: string; [key: string]: any };
  language_id: string | { _id: string; name: string; code: string; [key: string]: any };
  title: string;
  slug: string;
  order?: number;
  is_published?: boolean;
  content?: string; // HTML
  tag?: string[];
  source?: string;
  author?: string;
  createdAt?: string;
  updatedAt?: string;
  translation?: any;
  translations?: any[];
}

export const getSubtopicsWithPagination = async (
  page = 1,
  limit = 10,
  topic_id?: string,
  search?: string
) => {
  const params: any = { page, limit };
  if (topic_id) params.topic_id = topic_id;
  if (search) params.search = search;
  const res = await api.get(`${API_ENDPOINTS.subtopics}/paginated`, { params });
  return res.data;
};

export const getSubtopics = async (topic_id?: string): Promise<ISubtopic[]> => {
  const params: any = {};
  if (topic_id) params.topic_id = topic_id;
  const res = await api.get(API_ENDPOINTS.subtopics, { params });
  return res.data;
};

export const createSubtopic = async (data: Partial<ISubtopic>) => {
  const res = await api.post(API_ENDPOINTS.subtopics, data);
  return res.data;
};

export const updateSubtopic = async (id: string, data: Partial<ISubtopic>) => {
  const res = await api.put(`${API_ENDPOINTS.subtopics}/${id}`, data);
  return res.data;
};

export const deleteSubtopic = async (id: string) => {
  const res = await api.delete(`${API_ENDPOINTS.subtopics}/${id}`);
  return res.data;
};

export const bulkCreateSubtopics = async (rows: Partial<ISubtopic>[]) => {
  const res = await api.post(`${API_ENDPOINTS.subtopics}/bulk`, { subtopics: rows });
  return res.data;
};



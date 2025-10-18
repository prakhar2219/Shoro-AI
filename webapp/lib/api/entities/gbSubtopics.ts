import { api } from '../axios';

export interface IGBSubtopic {
  _id?: string;
  gb_topic_id: string;
  name: string;
  slug: string;
  description?: string;
  content?: string;
  language_id: string;
  order: number;
  image?: string;
  tag?: string[];
  source?: string;
  author?: string;
  is_published: boolean;
  created_by?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GBSubtopicsResponse {
  data: IGBSubtopic[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const getGBSubtopics = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  gb_topic_id?: string;
  language_id?: string;
}): Promise<GBSubtopicsResponse> => {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  if (params?.search) searchParams.append('search', params.search);
  if (params?.gb_topic_id) searchParams.append('gb_topic_id', params.gb_topic_id);
  if (params?.language_id) searchParams.append('language_id', params.language_id);

  const response = await api.get(`/content/gb-subtopics?${searchParams.toString()}`);
  return response.data;
};

export const getGBSubtopicById = async (id: string): Promise<IGBSubtopic> => {
  const response = await api.get(`/content/gb-subtopics/${id}`);
  return response.data;
};

export const createGBSubtopic = async (data: Omit<IGBSubtopic, '_id' | 'createdAt' | 'updatedAt'>): Promise<IGBSubtopic> => {
  const response = await api.post('/content/gb-subtopics', data);
  return response.data;
};

export const updateGBSubtopic = async (id: string, data: Partial<IGBSubtopic>): Promise<IGBSubtopic> => {
  const response = await api.put(`/content/gb-subtopics/${id}`, data);
  return response.data;
};

export const deleteGBSubtopic = async (id: string): Promise<void> => {
  await api.delete(`/content/gb-subtopics/${id}`);
};

export const bulkCreateGBSubtopics = async (subtopics: Omit<IGBSubtopic, '_id' | 'createdAt' | 'updatedAt'>[]): Promise<IGBSubtopic[]> => {
  const response = await api.post('/content/gb-subtopics/bulk', { subtopics });
  return response.data;
};

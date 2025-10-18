import { api } from '../axios';

export interface IGBTopic {
  _id?: string;
  gb_category_id: string;
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

export interface GBTopicsResponse {
  data: IGBTopic[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const getGBTopics = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  gb_category_id?: string;
  language_id?: string;
}): Promise<GBTopicsResponse> => {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  if (params?.search) searchParams.append('search', params.search);
  if (params?.gb_category_id) searchParams.append('gb_category_id', params.gb_category_id);
  if (params?.language_id) searchParams.append('language_id', params.language_id);

  const response = await api.get(`/content/gb-topics?${searchParams.toString()}`);
  return response.data;
};

export const getGBTopicById = async (id: string): Promise<IGBTopic> => {
  const response = await api.get(`/content/gb-topics/${id}`);
  return response.data;
};

export const createGBTopic = async (data: Omit<IGBTopic, '_id' | 'createdAt' | 'updatedAt'>): Promise<IGBTopic> => {
  const response = await api.post('/content/gb-topics', data);
  return response.data;
};

export const updateGBTopic = async (id: string, data: Partial<IGBTopic>): Promise<IGBTopic> => {
  const response = await api.put(`/content/gb-topics/${id}`, data);
  return response.data;
};

export const deleteGBTopic = async (id: string): Promise<void> => {
  await api.delete(`/content/gb-topics/${id}`);
};

export const bulkCreateGBTopics = async (topics: Omit<IGBTopic, '_id' | 'createdAt' | 'updatedAt'>[]): Promise<IGBTopic[]> => {
  const response = await api.post('/content/gb-topics/bulk', { topics });
  return response.data;
};

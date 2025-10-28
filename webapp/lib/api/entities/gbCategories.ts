import { api } from '../axios';

export interface IGBCategory {
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  content?: string;
  language_id: string;
  supported_language_ids?: string[];
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

export interface GBCategoriesResponse {
  data: IGBCategory[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const getGBCategories = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  language_id?: string;
}): Promise<GBCategoriesResponse> => {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  if (params?.search) searchParams.append('search', params.search);
  if (params?.language_id) searchParams.append('language_id', params.language_id);

  const response = await api.get(`/content/gb-categories?${searchParams.toString()}`);
  return response.data;
};

export const getGBCategoryById = async (id: string): Promise<IGBCategory> => {
  const response = await api.get(`/content/gb-categories/${id}`);
  return response.data;
};

export const createGBCategory = async (data: Omit<IGBCategory, '_id' | 'createdAt' | 'updatedAt'>): Promise<IGBCategory> => {
  const response = await api.post('/content/gb-categories', data);
  return response.data;
};

export const updateGBCategory = async (id: string, data: Partial<IGBCategory>): Promise<IGBCategory> => {
  const response = await api.put(`/content/gb-categories/${id}`, data);
  return response.data;
};

export const deleteGBCategory = async (id: string): Promise<void> => {
  await api.delete(`/content/gb-categories/${id}`);
};

export const bulkCreateGBCategories = async (categories: Omit<IGBCategory, '_id' | 'createdAt' | 'updatedAt'>[]): Promise<IGBCategory[]> => {
  const response = await api.post('/content/gb-categories/bulk', { categories });
  return response.data;
};

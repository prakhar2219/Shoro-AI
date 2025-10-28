import { api } from '../axios';

export interface IGBQuestion {
  _id?: string;
  gb_subtopic_id: string;
  question: string;
  slug: string;
  answer?: string;
  content?: string;
  language_id: string;
  supported_language_ids?: string[];
  order: number;
  image?: string;
  tag?: string[];
  source?: string;
  author?: string;
  difficulty_level: 'easy' | 'medium' | 'hard';
  is_published: boolean;
  created_by?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GBQuestionsResponse {
  data: IGBQuestion[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const getGBQuestions = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  gb_subtopic_id?: string;
  language_id?: string;
  difficulty_level?: string;
}): Promise<GBQuestionsResponse> => {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  if (params?.search) searchParams.append('search', params.search);
  if (params?.gb_subtopic_id) searchParams.append('gb_subtopic_id', params.gb_subtopic_id);
  if (params?.language_id) searchParams.append('language_id', params.language_id);
  if (params?.difficulty_level) searchParams.append('difficulty_level', params.difficulty_level);

  const response = await api.get(`/content/gb-questions?${searchParams.toString()}`);
  return response.data;
};

export const getGBQuestionById = async (id: string): Promise<IGBQuestion> => {
  const response = await api.get(`/content/gb-questions/${id}`);
  return response.data;
};

export const createGBQuestion = async (data: Omit<IGBQuestion, '_id' | 'createdAt' | 'updatedAt'>): Promise<IGBQuestion> => {
  const response = await api.post('/content/gb-questions', data);
  return response.data;
};

export const updateGBQuestion = async (id: string, data: Partial<IGBQuestion>): Promise<IGBQuestion> => {
  const response = await api.put(`/content/gb-questions/${id}`, data);
  return response.data;
};

export const deleteGBQuestion = async (id: string): Promise<void> => {
  await api.delete(`/content/gb-questions/${id}`);
};

export const bulkCreateGBQuestions = async (questions: Omit<IGBQuestion, '_id' | 'createdAt' | 'updatedAt'>[]): Promise<IGBQuestion[]> => {
  const response = await api.post('/content/gb-questions/bulk', { questions });
  return response.data;
};

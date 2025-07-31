import { api } from '../axios';
import { API_ENDPOINTS } from '../endpoints';

export interface IMCQOption {
  key: string;
  text: string;
}

export interface IMCQ {
  _id?: string;
  entity_type: string;
  entity_id: string;
  question: string;
  options: IMCQOption[];
  correct_answer: string;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  is_active: boolean;
  content: any[];
  translation?: any;
  translations?: any[];
  createdAt?: string;
  updatedAt?: string;
}

export interface IMCQTranslation {
  _id?: string;
  mcq_id: string;
  language_id: string;
  question: string;
  options: IMCQOption[];
  correct_answer: string;
  explanation?: string;
  translated_by_ai?: boolean;
  needs_review?: boolean;
  updated_by?: string;
  content: any[];
  createdAt?: string;
  updatedAt?: string;
}

// Paginated fetch
export const getMCQs = async ({ page = 1, limit = 10, search = '', entity_type, entity_id, language_id }: {
  page?: number;
  limit?: number;
  search?: string;
  entity_type?: string;
  entity_id?: string;
  language_id?: string;
} = {}) => {
  const params: any = { page, limit };
  if (search) params.search = search;
  if (entity_type) params.entity_type = entity_type;
  if (entity_id) params.entity_id = entity_id;
  if (language_id) params.language_id = language_id;
  
  const res = await api.get(`${API_ENDPOINTS.mcqs}/paginated`, { params });
  return res.data;
};

// Get single MCQ
export const getMCQ = async (id: string, language_id?: string) => {
  const params: any = {};
  if (language_id) params.language_id = language_id;
  
  const res = await api.get(`${API_ENDPOINTS.mcqs}/${id}`, { params });
  return res.data;
};

// Create MCQ
export const createMCQ = async (data: Omit<IMCQ, '_id' | 'createdAt' | 'updatedAt'>) => {
  const res = await api.post(API_ENDPOINTS.mcqs, data);
  return res.data;
};

// Update MCQ
export const updateMCQ = async (id: string, data: Partial<IMCQ>) => {
  const res = await api.put(`${API_ENDPOINTS.mcqs}/${id}`, data);
  return res.data;
};

// Delete MCQ
export const deleteMCQ = async (id: string) => {
  const res = await api.delete(`${API_ENDPOINTS.mcqs}/${id}`);
  return res.data;
};

// MCQ Translation API
export const getMCQTranslations = async (mcqId: string): Promise<IMCQTranslation[]> => {
  const res = await api.get(`${API_ENDPOINTS.mcqs}/${mcqId}/translations`);
  return res.data;
};

export const createMCQTranslation = async (mcqId: string, data: Omit<IMCQTranslation, '_id' | 'mcq_id' | 'createdAt' | 'updatedAt'>) => {
  const res = await api.post(`${API_ENDPOINTS.mcqs}/${mcqId}/translations`, data);
  return res.data;
};

export const updateMCQTranslation = async (mcqId: string, translationId: string, data: Partial<IMCQTranslation>) => {
  const res = await api.put(`${API_ENDPOINTS.mcqs}/${mcqId}/translations/${translationId}`, data);
  return res.data;
};

export const deleteMCQTranslation = async (mcqId: string, translationId: string) => {
  const res = await api.delete(`${API_ENDPOINTS.mcqs}/${mcqId}/translations/${translationId}`);
  return res.data;
}; 
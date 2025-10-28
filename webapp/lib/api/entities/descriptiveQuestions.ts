import { api } from '../axios';
import { API_ENDPOINTS } from '../endpoints';

export interface IDescriptiveQuestion {
  _id?: string;
  entity_type: string;
  entity_id: string;
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  is_active: boolean;
  content: any[];
  author?: string;
  source?: string;
  translation?: any;
  translations?: any[];
  createdAt?: string;
  updatedAt?: string;
}

export interface IDescriptiveQuestionTranslation {
  _id?: string;
  descriptive_question_id: string;
  language_id: string;
  question: string;
  answer: string;
  translated_by_ai?: boolean;
  needs_review?: boolean;
  updated_by?: string;
  content: any[];
  createdAt?: string;
  updatedAt?: string;
}

// Paginated fetch
export const getDescriptiveQuestions = async ({ page = 1, limit = 10, search = '', entity_type, entity_id, language_id }: {
  page?: number;
  limit?: number;
  search?: string;
  entity_type?: string;
  entity_id?: string;
  language_id?: string;
} = {}) => {
  try {
    const params: any = { page, limit };
    if (search) params.search = search;
    if (entity_type) params.entity_type = entity_type;
    if (entity_id) params.entity_id = entity_id;
    if (language_id) params.language_id = language_id;
    
    console.log('Fetching Descriptive Questions from:', `${api.defaults.baseURL}${API_ENDPOINTS.descriptiveQuestions}/paginated`);
    console.log('Descriptive Question params:', params);
    const res = await api.get(`${API_ENDPOINTS.descriptiveQuestions}/paginated`, { params });
    console.log('Descriptive Question API response:', res);
    return res.data;
  } catch (error: any) {
    console.error('Error fetching Descriptive Questions:', error);
    console.error('Error details:', error.response?.data);
    console.error('Error status:', error.response?.status);
    throw error;
  }
};

// Get single Descriptive Question
export const getDescriptiveQuestion = async (id: string, language_id?: string) => {
  const params: any = {};
  if (language_id) params.language_id = language_id;
  
  const res = await api.get(`${API_ENDPOINTS.descriptiveQuestions}/${id}`, { params });
  return res.data;
};

// Create Descriptive Question
export const createDescriptiveQuestion = async (data: Omit<IDescriptiveQuestion, '_id' | 'createdAt' | 'updatedAt'>) => {
  const res = await api.post(API_ENDPOINTS.descriptiveQuestions, data);
  return res.data;
};

// Update Descriptive Question
export const updateDescriptiveQuestion = async (id: string, data: Partial<IDescriptiveQuestion>) => {
  const res = await api.put(`${API_ENDPOINTS.descriptiveQuestions}/${id}`, data);
  return res.data;
};

// Delete Descriptive Question
export const deleteDescriptiveQuestion = async (id: string) => {
  const res = await api.delete(`${API_ENDPOINTS.descriptiveQuestions}/${id}`);
  return res.data;
};

// Bulk create Descriptive Questions
export const bulkCreateDescriptiveQuestions = async (descriptive_questions: Omit<IDescriptiveQuestion, '_id' | 'createdAt' | 'updatedAt'>[]) => {
  const res = await api.post(`${API_ENDPOINTS.descriptiveQuestions}/bulk`, { descriptive_questions });
  return res.data;
};

// Descriptive Question Translation API
export const getDescriptiveQuestionTranslations = async (questionId: string): Promise<IDescriptiveQuestionTranslation[]> => {
  const res = await api.get(`${API_ENDPOINTS.descriptiveQuestions}/${questionId}/translations`);
  return res.data;
};

export const createDescriptiveQuestionTranslation = async (questionId: string, data: Omit<IDescriptiveQuestionTranslation, '_id' | 'descriptive_question_id' | 'createdAt' | 'updatedAt'>) => {
  const res = await api.post(`${API_ENDPOINTS.descriptiveQuestions}/${questionId}/translations`, data);
  return res.data;
};

export const updateDescriptiveQuestionTranslation = async (questionId: string, translationId: string, data: Partial<IDescriptiveQuestionTranslation>) => {
  const res = await api.put(`${API_ENDPOINTS.descriptiveQuestions}/${questionId}/translations/${translationId}`, data);
  return res.data;
};

export const deleteDescriptiveQuestionTranslation = async (questionId: string, translationId: string) => {
  const res = await api.delete(`${API_ENDPOINTS.descriptiveQuestions}/${questionId}/translations/${translationId}`);
  return res.data;
}; 
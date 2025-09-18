import { api } from '../axios';
import { API_ENDPOINTS } from '../endpoints';

export interface IFAQ {
  _id?: string;
  entity_type: string;
  entity_id: string;
  question: string;
  answer: string;
  category?: string;
  order: number;
  is_active: boolean;
  content: any[];
  translation?: any;
  translations?: any[];
  createdAt?: string;
  updatedAt?: string;
}

export interface IFAQTranslation {
  _id?: string;
  faq_id: string;
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
export const getFAQs = async ({ page = 1, limit = 10, search = '', entity_type, entity_id, language_id }: {
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
  
  const res = await api.get(`${API_ENDPOINTS.faqs}/paginated`, { params });
  return res.data;
};

// Get single FAQ
export const getFAQ = async (id: string, language_id?: string) => {
  const params: any = {};
  if (language_id) params.language_id = language_id;
  
  const res = await api.get(`${API_ENDPOINTS.faqs}/${id}`, { params });
  return res.data;
};

// Create FAQ
export const createFAQ = async (data: Omit<IFAQ, '_id' | 'createdAt' | 'updatedAt'>) => {
  const res = await api.post(API_ENDPOINTS.faqs, data);
  return res.data;
};

// Update FAQ
export const updateFAQ = async (id: string, data: Partial<IFAQ>) => {
  const res = await api.put(`${API_ENDPOINTS.faqs}/${id}`, data);
  return res.data;
};

// Delete FAQ
export const deleteFAQ = async (id: string) => {
  const res = await api.delete(`${API_ENDPOINTS.faqs}/${id}`);
  return res.data;
};

// Bulk create FAQs
export const bulkCreateFAQs = async (faqs: Omit<IFAQ, '_id' | 'createdAt' | 'updatedAt'>[]) => {
  const res = await api.post(`${API_ENDPOINTS.faqs}/bulk`, { faqs });
  return res.data;
};

// FAQ Translation API
export const getFAQTranslations = async (faqId: string): Promise<IFAQTranslation[]> => {
  const res = await api.get(`${API_ENDPOINTS.faqs}/${faqId}/translations`);
  return res.data;
};

export const createFAQTranslation = async (faqId: string, data: Omit<IFAQTranslation, '_id' | 'faq_id' | 'createdAt' | 'updatedAt'>) => {
  const res = await api.post(`${API_ENDPOINTS.faqs}/${faqId}/translations`, data);
  return res.data;
};

export const updateFAQTranslation = async (faqId: string, translationId: string, data: Partial<IFAQTranslation>) => {
  const res = await api.put(`${API_ENDPOINTS.faqs}/${faqId}/translations/${translationId}`, data);
  return res.data;
};

export const deleteFAQTranslation = async (faqId: string, translationId: string) => {
  const res = await api.delete(`${API_ENDPOINTS.faqs}/${faqId}/translations/${translationId}`);
  return res.data;
}; 
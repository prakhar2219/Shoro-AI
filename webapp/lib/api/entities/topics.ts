import { api } from '../axios';
import { API_ENDPOINTS } from '../endpoints';

export interface ITopic {
  _id?: string;
  chapter_id: string | { _id: string; title: string };
  language_id: string | { _id: string; name: string; code: string; [key: string]: any };
  supported_language_ids?: string[];
  title: string;
  slug: string;
  order?: number;
  is_published?: boolean;
  content?: string; // HTML string like chapters
  tag?: string[];
  source?: string;
  author?: string;
  createdAt?: string;
  updatedAt?: string;
  translation?: any;
  translations?: any[];
}

export const getTopicsWithPagination = async (
  page = 1,
  limit = 10,
  chapter_id?: string,
  search?: string
) => {
  try {
    const params: any = { page, limit };
    if (chapter_id) params.chapter_id = chapter_id;
    if (search) params.search = search;
    
    console.log('Fetching Topics from:', `${api.defaults.baseURL}${API_ENDPOINTS.topics}/paginated`);
    console.log('Topic params:', params);
    const res = await api.get(`${API_ENDPOINTS.topics}/paginated`, { params });
    console.log('Topic API response:', res);
    return res.data;
  } catch (error: any) {
    console.error('Error fetching Topics:', error);
    console.error('Error details:', error.response?.data);
    console.error('Error status:', error.response?.status);
    throw error;
  }
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

// Translation API functions
export interface ITopicTranslation {
  topic_id: string;
  language_id: string;
  title: string;
  slug: string;
  content?: string;
  translated_by_ai?: boolean;
  needs_review?: boolean;
  updated_by?: string;
}

export const createTopicTranslation = async (data: ITopicTranslation) => {
  try {
    console.log('Creating topic translation:', data);
    const res = await api.post(`${API_ENDPOINTS.topics}/translations`, data);
    console.log('Topic translation created:', res.data);
    return res.data;
  } catch (error: any) {
    console.error('Error creating topic translation:', error);
    console.error('Error details:', error.response?.data);
    console.error('Error status:', error.response?.status);
    throw error;
  }
};

export const updateTopicTranslation = async (topic_id: string, language_id: string, data: Partial<ITopicTranslation>) => {
  try {
    console.log('Updating topic translation:', { topic_id, language_id, data });
    const res = await api.put(`${API_ENDPOINTS.topics}/${topic_id}/translations/${language_id}`, data);
    console.log('Topic translation updated:', res.data);
    return res.data;
  } catch (error: any) {
    console.error('Error updating topic translation:', error);
    console.error('Error details:', error.response?.data);
    console.error('Error status:', error.response?.status);
    throw error;
  }
};

export const deleteTopicTranslation = async (topic_id: string, language_id: string) => {
  try {
    console.log('Deleting topic translation:', { topic_id, language_id });
    const res = await api.delete(`${API_ENDPOINTS.topics}/${topic_id}/translations/${language_id}`);
    console.log('Topic translation deleted:', res.data);
    return res.data;
  } catch (error: any) {
    console.error('Error deleting topic translation:', error);
    console.error('Error details:', error.response?.data);
    console.error('Error status:', error.response?.status);
    throw error;
  }
};

export const getTopicTranslations = async (topic_id: string) => {
  try {
    console.log('Fetching topic translations for:', topic_id);
    const res = await api.get(`${API_ENDPOINTS.topics}/${topic_id}/translations`);
    console.log('Topic translations fetched:', res.data);
    return res.data;
  } catch (error: any) {
    console.error('Error fetching topic translations:', error);
    console.error('Error details:', error.response?.data);
    console.error('Error status:', error.response?.status);
    throw error;
  }
};

export const getTopicWithTranslations = async (id: string) => {
  try {
    console.log('Fetching topic with translations:', id);
    const res = await api.get(`${API_ENDPOINTS.topics}/${id}/with-translations`);
    console.log('Topic with translations fetched:', res.data);
    return res.data;
  } catch (error: any) {
    console.error('Error fetching topic with translations:', error);
    console.error('Error details:', error.response?.data);
    console.error('Error status:', error.response?.status);
    throw error;
  }
};



import { api } from '../axios';
import { API_ENDPOINTS } from '../endpoints';

// Language interface based on the backend types
export interface ILanguage {
  _id?: string;
  code: string; // e.g., 'en'
  name: string; // English
  native_name: string; // English or हिंदी
  direction: 'ltr' | 'rtl';
  locale?: string;
  script?: string;
  ai_supported: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Create language request interface
export interface ICreateLanguageRequest {
  code: string;
  name: string;
  native_name: string;
  direction?: 'ltr' | 'rtl';
  locale?: string;
  script?: string;
  ai_supported?: boolean;
}

// Update language request interface
export interface IUpdateLanguageRequest {
  name?: string;
  native_name?: string;
  direction?: 'ltr' | 'rtl';
  locale?: string;
  script?: string;
  ai_supported?: boolean;
}

// Pagination response interface
export interface IPaginationResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Response interfaces
export interface ILanguageResponse {
  success: boolean;
  data: ILanguage;
  message?: string;
}

export interface ILanguagesResponse {
  success: boolean;
  data: ILanguage[];
  message?: string;
}

// Language statistics interface
export interface ILanguageStats {
  total: number;
  aiSupported: number;
  ltrCount: number;
  rtlCount: number;
}

// Get all languages
export const getLanguages = async (): Promise<ILanguage[]> => {
  try {
    console.log('Fetching languages from:', `${api.defaults.baseURL}${API_ENDPOINTS.languages}`);
    const response = await api.get(API_ENDPOINTS.languages);
    console.log('Languages API response:', response);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching languages:', error);
    console.error('Error details:', error.response?.data);
    console.error('Error status:', error.response?.status);
    throw error;
  }
};

// Get language by code
export const getLanguage = async (code: string): Promise<ILanguage> => {
  try {
    const response = await api.get(`${API_ENDPOINTS.languages}/${code}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching language with code ${code}:`, error);
    throw error;
  }
};

// Create new language
export const createLanguage = async (data: ICreateLanguageRequest): Promise<ILanguage> => {
  try {
    const response = await api.post(API_ENDPOINTS.languages, data);
    return response.data;
  } catch (error) {
    console.error('Error creating language:', error);
    throw error;
  }
};

// Update language by code
export const updateLanguage = async (code: string, data: IUpdateLanguageRequest): Promise<ILanguage> => {
  try {
    const response = await api.put(`${API_ENDPOINTS.languages}/${code}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating language with code ${code}:`, error);
    throw error;
  }
};

// Delete language by code
export const deleteLanguage = async (code: string): Promise<void> => {
  try {
    await api.delete(`${API_ENDPOINTS.languages}/${code}`);
  } catch (error) {
    console.error(`Error deleting language with code ${code}:`, error);
    throw error;
  }
};

// Get languages with pagination
export const getLanguagesWithPagination = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
  direction?: 'ltr' | 'rtl',
  ai_supported?: boolean
): Promise<IPaginationResponse<ILanguage>> => {
  try {
    const params: any = { page, limit };
    if (search) params.search = search;
    if (direction) params.direction = direction;
    if (ai_supported !== undefined) params.ai_supported = ai_supported;

    console.log('Fetching languages with pagination from:', `${api.defaults.baseURL}${API_ENDPOINTS.languages}/paginated`);
    console.log('Pagination params:', params);
    const response = await api.get(`${API_ENDPOINTS.languages}/paginated`, { params });
    console.log('Languages pagination API response:', response);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching languages with pagination:', error);
    console.error('Error details:', error.response?.data);
    console.error('Error status:', error.response?.status);
    throw error;
  }
};

// Search languages by name, code, or native_name
export const searchLanguages = async (query: string): Promise<ILanguage[]> => {
  try {
    const response = await api.get(`${API_ENDPOINTS.languages}/search`, {
      params: { q: query }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching languages:', error);
    throw error;
  }
};

// Get AI supported languages only
export const getAISupportedLanguages = async (): Promise<ILanguage[]> => {
  try {
    const response = await api.get(`${API_ENDPOINTS.languages}/ai-supported`);
    return response.data;
  } catch (error) {
    console.error('Error fetching AI supported languages:', error);
    throw error;
  }
};

// Get languages by direction (LTR or RTL)
export const getLanguagesByDirection = async (direction: 'ltr' | 'rtl'): Promise<ILanguage[]> => {
  try {
    const response = await api.get(`${API_ENDPOINTS.languages}/direction/${direction}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${direction} languages:`, error);
    throw error;
  }
};

// Bulk create languages
export const bulkCreateLanguages = async (languages: ICreateLanguageRequest[]): Promise<ILanguage[]> => {
  try {
    const response = await api.post(`${API_ENDPOINTS.languages}/bulk`, { languages });
    return response.data;
  } catch (error) {
    console.error('Error bulk creating languages:', error);
    throw error;
  }
};

// Get language statistics
export const getLanguageStats = async (): Promise<ILanguageStats> => {
  try {
    const response = await api.get(`${API_ENDPOINTS.languages}/stats`);
    return response.data;
  } catch (error) {
    console.error('Error fetching language statistics:', error);
    throw error;
  }
};

// Get languages with filters (convenience function)
export const getLanguagesWithFilters = async (filters: {
  search?: string;
  direction?: 'ltr' | 'rtl';
  ai_supported?: boolean;
  page?: number;
  limit?: number;
}): Promise<ILanguage[] | IPaginationResponse<ILanguage>> => {
  const { search, direction, ai_supported, page, limit } = filters;

  if (search) {
    return await searchLanguages(search);
  }

  if (direction) {
    return await getLanguagesByDirection(direction);
  }

  if (ai_supported !== undefined) {
    return await getAISupportedLanguages();
  }

  if (page || limit) {
    return await getLanguagesWithPagination(page || 1, limit || 10);
  }

  return await getLanguages();
};

import { api } from '../axios';
import { API_ENDPOINTS } from '../endpoints';

export interface ICountry {
  _id?: string;
  name: string;
  code: string;
  default_language_code: string;
  supported_language_codes: string[];
  content?: any[];
  createdAt?: string;
  updatedAt?: string;
  translation?: ICountryTranslation; // single translation (already present in BE)
  translations?: ICountryTranslation[]; // all translations (new)
}

export interface ICreateCountryRequest {
  name: string;
  code: string;
  default_language_code: string;
  supported_language_codes?: string[];
}

export interface IUpdateCountryRequest {
  name?: string;
  default_language_code?: string;
  supported_language_codes?: string[];
}

export interface IPaginationResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ICountryStats {
  total: number;
}

export const getCountries = async (language_code?: string): Promise<ICountry[]> => {
  const params = language_code ? { language_code } : undefined;
  const res = await api.get(API_ENDPOINTS.countries, { params });
  return res.data;
};

export const getCountry = async (code: string, language_code?: string): Promise<ICountry> => {
  const params = language_code ? { language_code } : undefined;
  const res = await api.get(`${API_ENDPOINTS.countries}/${code}`, { params });
  return res.data;
};

export const createCountry = async (data: ICreateCountryRequest): Promise<ICountry> => {
  const res = await api.post(API_ENDPOINTS.countries, data);
  return res.data;
};

export const updateCountry = async (code: string, data: IUpdateCountryRequest): Promise<ICountry> => {
  const res = await api.put(`${API_ENDPOINTS.countries}/${code}`, data);
  return res.data;
};

export const deleteCountry = async (code: string): Promise<void> => {
  await api.delete(`${API_ENDPOINTS.countries}/${code}`);
};

export const getCountriesWithPagination = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
  language_code?: string
): Promise<IPaginationResponse<ICountry>> => {
  try {
    const params: any = { page, limit };
    if (search) params.search = search;
    if (language_code) params.language_code = language_code;
    
    console.log('Fetching Countries from:', `${api.defaults.baseURL}${API_ENDPOINTS.countries}/paginated`);
    console.log('Country params:', params);
    const res = await api.get(`${API_ENDPOINTS.countries}/paginated`, { params });
    console.log('Country API response:', res);
    return res.data;
  } catch (error: any) {
    console.error('Error fetching Countries:', error);
    console.error('Error details:', error.response?.data);
    console.error('Error status:', error.response?.status);
    throw error;
  }
};

export const searchCountries = async (query: string, language_code?: string): Promise<ICountry[]> => {
  const params: any = { q: query };
  if (language_code) params.language_code = language_code;
  const res = await api.get(`${API_ENDPOINTS.countries}/search`, { params });
  return res.data;
};

export const bulkCreateCountries = async (countries: ICreateCountryRequest[]): Promise<any> => {
  const res = await api.post(`${API_ENDPOINTS.countries}/bulk`, { countries });
  return res.data;
};

export const getCountryStats = async (): Promise<ICountryStats> => {
  try {
    console.log('Fetching Country Stats from:', `${api.defaults.baseURL}${API_ENDPOINTS.countries}/stats`);
    const res = await api.get(`${API_ENDPOINTS.countries}/stats`);
    console.log('Country Stats API response:', res);
    return res.data;
  } catch (error: any) {
    console.error('Error fetching Country Stats:', error);
    console.error('Error details:', error.response?.data);
    console.error('Error status:', error.response?.status);
    throw error;
  }
};

// Country Translation Types
export interface ICountryTranslation {
  _id?: string;
  country_id: string;
  language_code: string;
  name: string;
  translated_by_ai?: boolean;
  needs_review?: boolean;
  updated_by?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Country Translation API
export const getCountryTranslations = async (countryCode: string): Promise<ICountryTranslation[]> => {
  const res = await api.get(`${API_ENDPOINTS.countries}/${countryCode}/translations`);
  return res.data;
};

export const getCountryTranslation = async (countryCode: string, translationId: string): Promise<ICountryTranslation> => {
  const res = await api.get(`${API_ENDPOINTS.countries}/${countryCode}/translations/${translationId}`);
  return res.data;
};

export const createCountryTranslation = async (countryCode: string, data: Omit<ICountryTranslation, '_id' | 'country_id' | 'createdAt' | 'updatedAt'>): Promise<ICountryTranslation> => {
  const res = await api.post(`${API_ENDPOINTS.countries}/${countryCode}/translations`, data);
  return res.data;
};

export const updateCountryTranslation = async (countryCode: string, translationId: string, data: Partial<ICountryTranslation>): Promise<ICountryTranslation> => {
  const res = await api.put(`${API_ENDPOINTS.countries}/${countryCode}/translations/${translationId}`, data);
  return res.data;
};

export const deleteCountryTranslation = async (countryCode: string, translationId: string): Promise<void> => {
  await api.delete(`${API_ENDPOINTS.countries}/${countryCode}/translations/${translationId}`);
};

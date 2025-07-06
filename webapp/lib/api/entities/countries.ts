import { api } from '../axios';
import { API_ENDPOINTS } from '../endpoints';
import { getCookie } from '../../utils/cookie';

export const getCountries = async () => {
    const language_id = getCookie('language_id');
    const res = await api.get(API_ENDPOINTS.countries, {
        params: language_id ? { language_id } : undefined,
    });
    return res.data;
};

export const createCountry = async (data: any) => {
    const res = await api.post(API_ENDPOINTS.countries, data);
    return res.data;
};

export const updateCountry = async (id: string, data: any) => {
    const res = await api.put(`${API_ENDPOINTS.countries}/${id}`, data);
    return res.data;
};

export const deleteCountry = async (id: string | number) => {
    const res = await api.delete(`${API_ENDPOINTS.countries}/${id}`);
    return res.data;
};

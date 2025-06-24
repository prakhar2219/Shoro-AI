import { api } from '../axios';
import { API_ENDPOINTS } from '../endpoints';

export const getCountries = async () => {
    const res = await api.get(API_ENDPOINTS.countries);
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

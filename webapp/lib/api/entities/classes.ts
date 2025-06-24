import { api } from '../axios';
import { API_ENDPOINTS } from '../endpoints';

export const getClasses = async () => {
    const res = await api.get(API_ENDPOINTS.classes);
    return res.data;
};

export const createClass = async (data: any) => {
    const res = await api.post(API_ENDPOINTS.classes, data);
    return res.data;
};

export const updateClass = async (id: string, data: any) => {
    const res = await api.put(`${API_ENDPOINTS.classes}/${id}`, data);
    return res.data;
};

export const deleteClass = async (id: string) => {
    const res = await api.delete(`${API_ENDPOINTS.classes}/${id}`);
    return res.data;
};
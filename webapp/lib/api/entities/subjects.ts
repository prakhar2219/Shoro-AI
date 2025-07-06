import { api } from '../axios';
import { API_ENDPOINTS } from '../endpoints';
import { getCookie } from '../../utils/cookie';

export const getSubjects = async () => {
    const language_id = getCookie('language_id');
    const res = await api.get(API_ENDPOINTS.subjects, {
        params: language_id ? { language_id } : undefined,
    });
    return res.data;
};

export const createSubject = async (data: any) => {
    const res = await api.post(API_ENDPOINTS.subjects, data);
    return res.data;
};

export const updateSubject = async (id: string, data: any) => {
    const res = await api.put(`${API_ENDPOINTS.subjects}/${id}`, data);
    return res.data;
};

export const deleteSubject = async (id: string) => {
    const res = await api.delete(`${API_ENDPOINTS.subjects}/${id}`);
    return res.data;
};
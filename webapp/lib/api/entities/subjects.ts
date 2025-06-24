import { api } from '../axios';
import { API_ENDPOINTS } from '../endpoints';

export const getSubjects = async () => {
    const res = await api.get(API_ENDPOINTS.subjects);
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
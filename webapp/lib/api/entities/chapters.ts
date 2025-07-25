import { api } from '../axios';
import { API_ENDPOINTS } from '../endpoints';

export const getChapters = async ({ page = 1, limit = 10 } = {}) => {
    const res = await api.get(API_ENDPOINTS.chapters, { params: { page, limit } });
    return res.data;
};

export const createChapter = async (data: any) => {
    const res = await api.post(API_ENDPOINTS.chapters, data);
    return res.data;
};

export const updateChapter = async (id: string, data: any) => {
    const res = await api.put(`${API_ENDPOINTS.chapters}/${id}`, data);
    return res.data;
};

export const deleteChapter = async (id: string) => {
    const res = await api.delete(`${API_ENDPOINTS.chapters}/${id}`);
    return res.data;
};
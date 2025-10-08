import { api } from './axios';
import { API_ENDPOINTS } from './endpoints';

export const uploadCSVEntity = async (entityType: string, data: any[]) => {
    const res = await api.post(`${API_ENDPOINTS.upload}/${entityType}`, data);
    return res.data;
};

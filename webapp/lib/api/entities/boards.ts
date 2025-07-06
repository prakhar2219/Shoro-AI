import { api } from '../axios';
import { API_ENDPOINTS } from '../endpoints';
import { getCookie } from '../../utils/cookie';

export const getBoards = async () => {
    const language_id = getCookie('language_id');
    const res = await api.get(API_ENDPOINTS.boards, {
        params: language_id ? { language_id } : undefined,
    });
    return res.data;
};

export const createBoard = async (data: any) => {
    const res = await api.post(API_ENDPOINTS.boards, data);
    return res.data;
};

export const updateBoard = async (id: string, data: any) => {
    const res = await api.put(`${API_ENDPOINTS.boards}/${id}`, data);
    return res.data;
};

export const deleteBoard = async (id: string) => {
    const res = await api.delete(`${API_ENDPOINTS.boards}/${id}`);
    return res.data;
};

export const getBoardsByCountry = async (country: string) => {
    const language_id = getCookie('language_id');
    const res = await api.get(`${API_ENDPOINTS.boards}?country=${encodeURIComponent(country)}` + (language_id ? `&language_id=${encodeURIComponent(language_id)}` : ''));
    return res.data;
};
import { api } from '../axios';
import { API_ENDPOINTS } from '../endpoints';

export const getBoards = async () => {
    const res = await api.get(API_ENDPOINTS.boards);
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
    const res = await api.get(`${API_ENDPOINTS.boards}?country=${encodeURIComponent(country)}`);
    return res.data;
};
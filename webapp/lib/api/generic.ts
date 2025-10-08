import { api } from './axios';

export const getEntityById = async (entityType: string, id: string) => {
    const res = await api.get(`/${entityType}/${id}`);
    return res.data;
};

export const deleteEntity = async (entityType: string, id: string) => {
    const res = await api.delete(`/${entityType}/${id}`);
    return res.data;
};

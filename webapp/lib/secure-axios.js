import axios from 'axios';
import Router from 'next/router';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true, 
});

let accessToken = null;

export const setAccessToken = (token) => {
    accessToken = token;
};

export const clearAccessToken = () => {
    accessToken = null;
};

api.interceptors.request.use(
    (config) => {
        if (accessToken) {
            config.headers['Authorization'] = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const response = await api.post('/auth/refresh', {}, { withCredentials: true });
                const newAccessToken = response.data.accessToken;

                setAccessToken(newAccessToken);

                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                clearAccessToken();
                await api.post('/auth/logout', {}, { withCredentials: true });

                if (typeof window !== 'undefined') {
                    Router.push('/login');
                }

                return Promise.reject(refreshError);
            }
        }

        // Handle other errors
        if (error.response?.status === 403) {
            console.error('Forbidden: You do not have access to this resource');
        } else if (error.response?.status === 500) {
            console.error('Server error: Please try again later');
        }

        return Promise.reject(error);
    }
);

export default api;
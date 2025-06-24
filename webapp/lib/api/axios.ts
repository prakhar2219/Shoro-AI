import axios from 'axios';

export const api = axios.create({
  baseURL: '/api', // or your actual backend endpoint
  headers: {
    'Content-Type': 'application/json',
  },
});

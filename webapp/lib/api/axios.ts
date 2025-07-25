import axios from 'axios';

export const api = axios.create({
  baseURL: 'https://education-ai-5pxt.onrender.com/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

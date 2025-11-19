import { api } from '../axios';

export interface IBlog {
  _id: string;
  title: string;
  slug: string;
  mainImage: string;
  content: string;
  excerpt: string;
  author: string;
  categories: string[];
  keywords: string[];
  published: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlogInput {
  title: string;
  slug: string;
  mainImage: string;
  content: string;
  keywords?: string[];
  excerpt?: string;
  author?: string;
  categories?: string[];
  published: boolean;
  publishedAt?: Date;
}

const API_BASE = '/blogs';

export const getBlogs = async (): Promise<IBlog[]> => {
  const response = await api.get(API_BASE);
  return response.data;
};

export const getBlogBySlug = async (slug: string): Promise<IBlog> => {
  const response = await api.get(`${API_BASE}/${slug}`);
  return response.data;
};

export const createBlog = async (data: BlogInput): Promise<IBlog> => {
  const response = await api.post(API_BASE, data);
  return response.data;
};

export const updateBlog = async (slug: string, data: Partial<BlogInput>): Promise<IBlog> => {
  const response = await api.put(`${API_BASE}/${slug}`, data);
  return response.data;
};

export const deleteBlog = async (slug: string): Promise<void> => {
  await api.delete(`${API_BASE}/${slug}`);
};

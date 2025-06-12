import Blog from '../models/blog.model';
import { BlogInput } from '../types/blog.types';

export const createBlog = async (data: BlogInput) => {
  return await Blog.create(data);
};

export const getAllBlogs = async () => {
  return await Blog.find().sort({ createdAt: -1 });
};

export const getBlogBySlug = async (slug: string) => {
  return await Blog.findOne({ slug });
};

export const updateBlog = async (slug: string, data: Partial<BlogInput>) => {
  return await Blog.findOneAndUpdate({ slug }, data, { new: true });
};

export const deleteBlog = async (slug: string) => {
  return await Blog.findOneAndDelete({ slug });
};

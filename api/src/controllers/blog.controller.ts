import { Request, Response } from 'express';
import * as blogService from '../services/blog.service';
import { BlogInput } from '../types/blog.types';

export const createBlog = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      title,
      slug,
      content,
      mainImage,
      keywords,
      excerpt,
      author,
      categories,
      published,
    } = req.body;
    if (!title || !slug || !mainImage || !author || !content) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Check for duplicate slug globally (since Blog has unique slug)
    const existingSlugBlog = await blogService.checkDuplicateSlug(slug);
    if (existingSlugBlog) {
      res.status(409).json({ 
        error: `A blog with slug "${slug}" already exists. Please use a different slug.` 
      });
      return;
    }

    const blog: BlogInput = {
      title,
      slug,
      mainImage,
      content: typeof content === 'string' ? content : '',
      keywords: Array.isArray(keywords) ? keywords : [],
      excerpt: typeof excerpt === 'string' ? excerpt : '',
      author,
      categories: Array.isArray(categories) ? categories : [],
      published: typeof published === 'boolean' ? published : false,
      publishedAt: published ? new Date() : undefined,
    };

    const created = await blogService.createBlog(blog);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const updateBlog = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      title,
      slug,
      content,
      mainImage,
      keywords,
      excerpt,
      author,
      categories,
      published,
    } = req.body;

    // Check for duplicate slug if slug is being updated
    if (slug) {
      const existingSlugBlog = await blogService.checkDuplicateSlug(slug, req.params.id);
      if (existingSlugBlog) {
        res.status(409).json({ 
          error: `A blog with slug "${slug}" already exists. Please use a different slug.` 
        });
        return;
      }
    }

    const data: Partial<BlogInput> = {
      ...(title && { title }),
      ...(slug && { slug }),
      ...(mainImage && { mainImage }),
      ...(typeof content === 'string' && { content }),
      ...(Array.isArray(keywords) && { keywords }),
      ...(typeof excerpt === 'string' && { excerpt }),
      ...(author && { author }),
      ...(Array.isArray(categories) && { categories }),
      ...(typeof published === 'boolean' && {
        published,
        publishedAt: published ? new Date() : undefined,
      }),
    };

    const updated = await blogService.updateBlog(req.params.slug, data);
    if (!updated) {
      res.status(404).json({ error: 'Blog not found' });
      return;
    }

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
export const getBlogs = async (_req: Request, res: Response): Promise<void> => {
  try {
    const blogs = await blogService.getAllBlogs();
    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    const blog = await blogService.getBlogBySlug(req.params.slug);
    if (!blog) {
      res.status(404).json({ error: 'Blog not found' });
      return;
    }

    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const deleteBlog = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const deleted = await blogService.deleteBlog(req.params.slug);

    if (!deleted) {
      res.status(404).json({ error: 'Blog not found' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

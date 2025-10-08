import { Router } from 'express';
import {
  createBlog,
  getBlogs,
  getBlog,
  updateBlog,
  deleteBlog,
} from '../controllers/blog.controller';

const router = Router();

router.post('/', createBlog);
router.get('/', getBlogs);
router.get('/:slug', getBlog);
router.put('/:slug', updateBlog);
router.delete('/:slug', deleteBlog);

export default router;

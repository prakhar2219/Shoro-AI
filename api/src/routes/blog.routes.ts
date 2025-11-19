import { Router } from 'express';
import {
  createBlog,
  getBlogs,
  getBlog,
  updateBlog,
  deleteBlog,
} from '../controllers/blog.controller';
import { clerkProtect, clerkRestrictTo } from '../middleware/clerkAuth';

const router = Router();

router.get('/', getBlogs);
router.get('/:slug', getBlog);
// Apply authentication and authorization to all blog routes
// Only authenticated admin users can manage blogs

router.use(clerkProtect);
router.use(clerkRestrictTo('super_admin', 'admin', 'editor'));

router.post('/', createBlog);
router.put('/:slug', updateBlog);
router.delete('/:slug', deleteBlog);

export default router;

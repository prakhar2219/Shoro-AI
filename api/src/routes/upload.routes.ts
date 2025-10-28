import { Router } from 'express';
import multer from 'multer';
import {
  uploadHandler,
  uploadImageForm,
} from '../controllers/upload.controller';
import { clerkProtect, clerkRestrictTo } from '../middleware/clerkAuth';

const router = Router();

// Apply authentication and authorization to upload routes
// Only authenticated admin users can upload files
router.use(clerkProtect);
router.use(clerkRestrictTo('super_admin', 'admin', 'editor'));

router.post('/image', uploadHandler);

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/image/form', upload.single('image'), uploadImageForm);

export default router;

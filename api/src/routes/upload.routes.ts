import { Router } from 'express';
import multer from 'multer';
import { uploadHandler, uploadImageForm } from '../controllers/upload.controller';

const router = Router();

router.post('/image', uploadHandler);

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/image/form', upload.single('image'), uploadImageForm);

export default router;

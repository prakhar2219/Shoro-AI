import { Request, Response } from 'express';
import { UploadRequestBody } from '../types/upload.types';
import {
  uploadImageToCloudinary,
  uploadImageFromFormBuffer,
} from '../services/upload.service';

export const uploadHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { base64 } = req.body as UploadRequestBody;

    if (!base64) {
      res.status(400).json({ error: 'base64 and type are required' });
      return;
    }

    const url = await uploadImageToCloudinary(base64);
    res.status(200).json({ url });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

interface MulterBufferRequest extends Request {
  file?: Express.Multer.File;
}

export const uploadImageForm = async (
  req: MulterBufferRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.file || !req.file.buffer) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const imageUrl = await uploadImageFromFormBuffer(req.file.buffer);
    res.status(200).json({ url: imageUrl });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

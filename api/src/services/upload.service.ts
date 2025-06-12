import { uploadImage, uploadBufferToCloudinary } from "../config/cloudinary";

export const uploadImageToCloudinary = async (base64: string): Promise<string> => {
    return await uploadImage(base64);
};

export const uploadImageFromFormBuffer = async (buffer: Buffer) => {
    return uploadBufferToCloudinary(buffer);
  };
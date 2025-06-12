import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export const uploadImage = async (base64: string): Promise<string> => {
    const uploadResponse = await cloudinary.uploader.upload(base64, {
        folder: 'uploads/images',
        resource_type: 'image',
    });

    return uploadResponse.secure_url;
};


export const uploadBufferToCloudinary = (fileBuffer: Buffer): Promise<string> => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: 'blogs', resource_type: 'image' },
            (error, result) => {
                if (error) return reject(error);
                if (result?.secure_url) return resolve(result.secure_url);
                return reject(new Error('Failed to upload to Cloudinary'));
            }
        );

        Readable.from(fileBuffer).pipe(stream);
    });
};

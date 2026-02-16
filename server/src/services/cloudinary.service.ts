import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Check if Cloudinary is configured
const isCloudinaryConfigured = !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
);

if (!isCloudinaryConfigured) {
    console.warn('⚠️ WARNING: Cloudinary is not configured!');
    console.warn('Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to your .env file');
    console.warn('Get free credentials from: https://cloudinary.com');
}

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        // Validate Cloudinary is configured
        if (!isCloudinaryConfigured) {
            throw new Error('Cloudinary is not configured. Please add credentials to .env file.');
        }

        // Determine folder and resource type
        const isVideo = file.mimetype.startsWith('video/');
        const isAudio = file.mimetype.startsWith('audio/');
        const isDocument = file.mimetype.includes('pdf') ||
            file.mimetype.includes('document') ||
            file.mimetype.includes('msword') ||
            file.mimetype.includes('text/');

        return {
            folder: 'repurposex',
            resource_type: isVideo || isAudio ? 'video' : (isDocument ? 'raw' : 'auto'),
            public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
            transformation: isVideo ? [{ quality: 'auto' }] : [],
        };
    },
});

export { isCloudinaryConfigured };
export default cloudinary;

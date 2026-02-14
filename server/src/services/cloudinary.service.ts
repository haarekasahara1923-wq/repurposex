import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        // Determine folder and resource type
        const isVideo = file.mimetype.startsWith('video/');
        const isAudio = file.mimetype.startsWith('audio/');

        return {
            folder: 'repurposex',
            resource_type: isVideo ? 'video' : (isAudio ? 'video' : 'auto'), // Cloudinary uses 'video' for audio too
            public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
            transformation: isVideo ? [{ quality: 'auto' }] : [],
        };
    },
});

export default cloudinary;

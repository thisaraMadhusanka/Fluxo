const cloudinary = require('cloudinary').v2;

// Configure Cloudinary with environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload an image to Cloudinary
 * @param {string} imageData - Base64 encoded image or URL
 * @param {object} options - Upload options
 * @returns {Promise<object>} - Upload result with secure_url and public_id
 */
const uploadImage = async (imageData, options = {}) => {
    try {
        // Check if Cloudinary is configured
        if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
            console.warn('⚠️ Cloudinary not configured - storing base64 locally');
            return { secure_url: imageData, public_id: null, isLocal: true };
        }

        const defaultOptions = {
            folder: 'fluxo/avatars',
            resource_type: 'image',
            transformation: [
                { width: 400, height: 400, crop: 'fill', gravity: 'face' },
                { quality: 'auto:good', fetch_format: 'auto' }
            ]
        };

        const uploadOptions = { ...defaultOptions, ...options };

        // Handle base64 or URL
        const result = await cloudinary.uploader.upload(imageData, uploadOptions);

        console.log('✅ Cloudinary upload successful:', result.secure_url);
        return {
            secure_url: result.secure_url,
            public_id: result.public_id,
            width: result.width,
            height: result.height
        };
    } catch (error) {
        console.error('❌ Cloudinary upload failed:', error.message);
        throw error;
    }
};

/**
 * Delete an image from Cloudinary
 * @param {string} publicId - The public_id of the image to delete
 * @returns {Promise<object>} - Deletion result
 */
const deleteImage = async (publicId) => {
    try {
        if (!publicId) return { result: 'no image to delete' };

        const result = await cloudinary.uploader.destroy(publicId);
        console.log('🗑️ Cloudinary delete:', result);
        return result;
    } catch (error) {
        console.error('❌ Cloudinary delete failed:', error.message);
        throw error;
    }
};

/**
 * Upload a file (non-image) to Cloudinary
 * @param {string} filePath - Path to the file
 * @param {object} options - Upload options
 * @returns {Promise<object>} - Upload result
 */
const uploadFile = async (filePath, options = {}) => {
    try {
        if (!process.env.CLOUDINARY_CLOUD_NAME) {
            console.warn('⚠️ Cloudinary not configured');
            return { secure_url: filePath, public_id: null };
        }

        const defaultOptions = {
            folder: 'fluxo/attachments',
            resource_type: 'auto'
        };

        const result = await cloudinary.uploader.upload(filePath, { ...defaultOptions, ...options });
        return result;
    } catch (error) {
        console.error('❌ Cloudinary file upload failed:', error.message);
        throw error;
    }
};

/**
 * Extract public_id from a Cloudinary URL
 * @param {string} url - Cloudinary URL
 * @returns {string|null} - public_id or null
 */
const getPublicIdFromUrl = (url) => {
    if (!url || !url.includes('cloudinary.com')) return null;

    try {
        // Extract public_id from URL like: https://res.cloudinary.com/cloud/image/upload/v123/folder/filename.ext
        const parts = url.split('/upload/');
        if (parts.length < 2) return null;

        const pathPart = parts[1];
        // Remove version (v123/) if present
        const withoutVersion = pathPart.replace(/^v\d+\//, '');
        // Remove file extension
        const publicId = withoutVersion.replace(/\.[^/.]+$/, '');

        return publicId;
    } catch (error) {
        return null;
    }
};

module.exports = {
    uploadImage,
    deleteImage,
    uploadFile,
    getPublicIdFromUrl,
    cloudinary // Export raw cloudinary for advanced usage
};

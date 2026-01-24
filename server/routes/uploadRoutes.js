const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');
const fs = require('fs');
const path = require('path');

// @desc    Upload file
// @route   POST /api/upload
// @access  Private
router.post('/', protect, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const isImage = req.file.mimetype.startsWith('image/');

        // For images, try to upload to Cloudinary
        if (isImage && process.env.CLOUDINARY_CLOUD_NAME) {
            try {
                const { uploadFile } = require('../services/cloudinaryService');
                const result = await uploadFile(req.file.path, {
                    folder: 'fluxo/attachments',
                    resource_type: 'image'
                });

                // Delete local temp file after Cloudinary upload
                try {
                    fs.unlinkSync(req.file.path);
                } catch (e) {
                    console.warn('Could not delete temp file:', e.message);
                }

                return res.json({
                    url: result.secure_url,
                    filename: result.public_id,
                    originalName: req.file.originalname,
                    mimetype: req.file.mimetype,
                    size: req.file.size
                });
            } catch (cloudinaryError) {
                console.warn('Cloudinary upload failed, using local:', cloudinaryError.message);
                // Fall through to local storage
            }
        }

        // For non-images or if Cloudinary fails, use local storage
        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

        res.json({
            url: fileUrl,
            filename: req.file.filename,
            originalName: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size
        });
    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ message: 'Server Error during upload' });
    }
});

module.exports = router;


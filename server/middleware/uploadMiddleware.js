const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
// On Vercel, use /tmp (only writable directory in serverless)
// On local/traditional servers, use ../uploads
const uploadDir = process.env.VERCEL
    ? '/tmp/uploads'
    : path.join(__dirname, '../../uploads');

// Safely create directory (won't crash if it fails)
try {
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }
} catch (error) {
    console.warn('Could not create uploads directory:', error.message);
    // On Vercel, /tmp might already exist or we don't have permissions
    // This is OK - multer will handle it
}

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Create unique filename with original extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    // Accept images, PDFs, docs
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error('Error: File type not supported!'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: fileFilter
});

module.exports = upload;

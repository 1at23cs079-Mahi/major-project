const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const ensureDirectoryExists = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

// Storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let uploadPath = 'backend/uploads/';

        // Determine directory based on file type and route
        if (req.baseUrl.includes('patient') || req.baseUrl.includes('medical-report')) {
            uploadPath += 'medical-reports/';
        } else if (req.baseUrl.includes('medicine')) {
            uploadPath += 'medicines/';
        } else if (req.baseUrl.includes('prescription')) {
            uploadPath += 'prescriptions/';
        } else if (req.baseUrl.includes('profile')) {
            uploadPath += 'profiles/';
        } else if (req.baseUrl.includes('insurance')) {
            uploadPath += 'insurance/';
        } else {
            uploadPath += 'misc/';
        }

        ensureDirectoryExists(uploadPath);
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    // Allowed file types
    const allowedMimes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'application/pdf',
        'image/webp'
    ];

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, GIF, WebP, and PDF files are allowed.'), false);
    }
};

// Configure multer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB default
    },
    fileFilter: fileFilter
});

module.exports = upload;

const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path');

// Configure Cloudinary
if (
  process.env.CLOUDINARY_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Allowed file types
const ALLOWED_MIME_TYPES = {
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    'docx',
  'image/jpeg': 'jpg',
  'image/png': 'png',
};

// File filter function
const fileFilter = (req, file, cb) => {
  // Validate mime type
  const isValidMimeType = ALLOWED_MIME_TYPES[file.mimetype];
  const fileExt = path.extname(file.originalname).toLowerCase();
  const isValidExt = /\.(pdf|doc|docx|jpg|jpeg|png)$/.test(fileExt);

  if (!isValidMimeType || !isValidExt) {
    return cb(
      new Error('Invalid file type. Allowed: PDF, DOC, DOCX, JPG, PNG'),
    );
  }

  cb(null, true);
};

// Use Cloudinary if credentials available, otherwise use memory storage
let storage;

if (process.env.CLOUDINARY_NAME) {
  // Production: Cloudinary
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    folder: 'jobportal',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
    public_id: (req, file) => {
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(7);
      return `${timestamp}-${randomStr}`;
    },
  });
} else {
  // Development: Memory storage (files not persisted)
  storage = multer.memoryStorage();
}

// Create multer upload instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

module.exports = upload;

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Set storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname),
    );
  },
});

// Strict file type whitelist
const ALLOWED_MIME_TYPES = {
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    'docx',
  'image/jpeg': 'jpg',
  'image/png': 'png',
};

// Check file type
const fileFilter = (req, file, cb) => {
  // Validate mime type strictly
  const isValidMimeType = ALLOWED_MIME_TYPES[file.mimetype];

  // Validate extension
  const fileExt = path.extname(file.originalname).toLowerCase();
  const isValidExt = /\.(pdf|doc|docx|jpg|jpeg|png)$/.test(fileExt);

  // Check for double extensions (security - prevents .pdf.exe attacks)
  const filename = path.basename(file.originalname, fileExt);
  if (/\./.test(filename)) {
    return cb(new Error('Invalid filename: double extensions not allowed'));
  }

  if (isValidMimeType && isValidExt) {
    return cb(null, true);
  } else {
    return cb(
      new Error(
        `Invalid file type. Only PDF, DOC, DOCX, JPG, JPEG, PNG allowed. Received: ${file.mimetype}`,
      ),
    );
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, // 5MB limit
  fileFilter: fileFilter,
});

module.exports = upload;

import multer from 'multer';

const ALLOWED_TYPES = [
  'application/pdf',
  'text/plain',
  'text/markdown',
];

const MAX_SIZE = 20 * 1024 * 1024; // 20MB

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_SIZE,
  },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, TXT, and Markdown are allowed.'));
    }
  },
});

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const backendRoot = path.resolve(__dirname, '..', '..');
const uploadsRoot = path.join(backendRoot, 'uploads');
const newsUploadsDir = path.join(uploadsRoot, 'news');

function ensureUploadsDir() {
  fs.mkdirSync(newsUploadsDir, { recursive: true });
}

function safeExtension(originalName) {
  const ext = path.extname(originalName || '').toLowerCase();

  if (!ext || ext.length > 12) {
    return '';
  }

  return ext.replace(/[^a-z0-9.]/g, '');
}

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    try {
      ensureUploadsDir();
      cb(null, newsUploadsDir);
    } catch (error) {
      cb(error);
    }
  },
  filename(_req, file, cb) {
    const ext = safeExtension(file.originalname);
    const random = Math.random().toString(16).slice(2);
    cb(null, `${Date.now()}-${random}${ext}`);
  },
});

function fileFilter(req, file, cb) {
  if (file.fieldname === 'image') {
    if (!file.mimetype?.startsWith('image/')) {
      return cb(new Error('Image upload must be an image file.'));
    }
  }

  // contentFile is optional and may be any reasonable file type.
  // Keep this permissive and rely on size limits.
  return cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024,
    fieldSize: 50 * 1024 * 1024,
  },
});

const uploadFields = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'contentFile', maxCount: 1 },
  { name: 'contentFile_en', maxCount: 1 },
  { name: 'contentFile_vi', maxCount: 1 },
]);

export default function maybeUploadNewsAssets(req, res, next) {
  const contentType = req.headers['content-type'] || '';

  if (contentType.includes('multipart/form-data')) {
    return uploadFields(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FIELD_VALUE') {
            return res.status(400).json({
              message: 'Field content is too long. If pasting large articles with images, try uploading as a Word document (.docx) or reducing image sizes.',
            });
          }
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
              message: 'File size exceeds the 25MB limit.',
            });
          }
          return res.status(400).json({ message: `Upload error: ${err.message}` });
        }
        return next(err);
      }
      return next();
    });
  }

  return next();
}

export { uploadsRoot };

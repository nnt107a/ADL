import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { uploadsRoot } from './newsAssetsUpload.js';

const peopleUploadsDir = path.join(uploadsRoot, 'people');

function ensureUploadsDir() {
  fs.mkdirSync(peopleUploadsDir, { recursive: true });
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
      cb(null, peopleUploadsDir);
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

function fileFilter(_req, file, cb) {
  if (!file.mimetype?.startsWith('image/')) {
    return cb(new Error('Upload must be an image file.'));
  }

  return cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
    fieldSize: 10 * 1024 * 1024,
  },
});

const uploadSingle = upload.single('image');

export default function maybeUploadPeopleImage(req, res, next) {
  const contentType = req.headers['content-type'] || '';

  if (contentType.includes('multipart/form-data')) {
    return uploadSingle(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          return res.status(400).json({ message: `Upload error: ${err.message}` });
        }
        return next(err);
      }
      return next();
    });
  }

  return next();
}

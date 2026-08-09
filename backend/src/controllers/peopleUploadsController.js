import { uploadToCloudinaryOrLocal } from '../services/cloudinaryService.js';

export async function uploadPeopleImage(req, res, _next, { kind } = {}) {
  if (!req.file) {
    return res.status(400).json({ message: 'Image file is required.' });
  }

  const url = await uploadToCloudinaryOrLocal(req.file, { folder: 'people' });
  return res.status(201).json({ url, kind: String(kind || '') });
}

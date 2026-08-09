import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;
const cloudinaryUrl = process.env.CLOUDINARY_URL;

const isCloudinaryConfigured = Boolean(cloudinaryUrl || (cloudName && apiKey && apiSecret));

if (isCloudinaryConfigured) {
  if (cloudinaryUrl) {
    cloudinary.config({ cloudinary_url: cloudinaryUrl });
  } else {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
  }
}

/**
 * Uploads a file (from multer disk storage) to Cloudinary if configured.
 * If Cloudinary is not configured or if upload fails, falls back gracefully
 * to returning the local relative URL (/uploads/...).
 *
 * @param {Object} file - Express multer file object
 * @param {Object} options - Options (folder: 'news' | 'people')
 * @returns {Promise<string>} - Cloudinary CDN secure URL or local fallback URL
 */
export async function uploadToCloudinaryOrLocal(file, options = {}) {
  if (!file) return '';

  const { folder = 'news', defaultLocalPath } = options;
  const localUrl = defaultLocalPath || `/uploads/${folder}/${file.filename}`;

  if (!isCloudinaryConfigured) {
    return localUrl;
  }

  try {
    const filePath = file.path;
    if (!filePath || !fs.existsSync(filePath)) {
      return localUrl;
    }

    const result = await cloudinary.uploader.upload(filePath, {
      folder: `adlegal/${folder}`,
      resource_type: 'auto',
    });

    // Cleanup local disk file after successful Cloudinary upload
    try {
      fs.unlinkSync(filePath);
    } catch (_e) {
      // Ignore cleanup error
    }

    return result.secure_url || result.url || localUrl;
  } catch (error) {
    console.error('Cloudinary upload failed, falling back to local storage:', error.message);
    return localUrl;
  }
}

export { isCloudinaryConfigured };

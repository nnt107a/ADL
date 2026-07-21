import { Router } from 'express';
import {
  createNews,
  deleteNewsBySlug,
  previewNewsContentFile,
  updateNewsBySlug,
  uploadNewsImage,
} from '../controllers/newsController.js';
import requireAdmin from '../middleware/requireAdmin.js';
import maybeUploadNewsAssets from '../middleware/newsAssetsUpload.js';

const router = Router();

router.post('/assets/image', requireAdmin, maybeUploadNewsAssets, uploadNewsImage);
router.post('/preview', requireAdmin, maybeUploadNewsAssets, previewNewsContentFile);
router.post('/', requireAdmin, maybeUploadNewsAssets, createNews);
router.put('/:slug', requireAdmin, maybeUploadNewsAssets, updateNewsBySlug);
router.delete('/:slug', requireAdmin, deleteNewsBySlug);

export default router;

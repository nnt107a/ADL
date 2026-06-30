import { Router } from 'express';
import { createNews, previewNewsContentFile, uploadNewsImage } from '../controllers/newsController.js';
import requireAdmin from '../middleware/requireAdmin.js';
import maybeUploadNewsAssets from '../middleware/newsAssetsUpload.js';

const router = Router();

router.post('/assets/image', requireAdmin, maybeUploadNewsAssets, uploadNewsImage);
router.post('/preview', requireAdmin, maybeUploadNewsAssets, previewNewsContentFile);
router.post('/', requireAdmin, maybeUploadNewsAssets, createNews);

export default router;

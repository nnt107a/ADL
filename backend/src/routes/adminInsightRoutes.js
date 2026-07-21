import { Router } from 'express';
import {
  createInsight,
  deleteInsightBySlug,
  updateInsightBySlug,
  uploadInsightImage,
} from '../controllers/insightController.js';
import requireAdmin from '../middleware/requireAdmin.js';
import maybeUploadNewsAssets from '../middleware/newsAssetsUpload.js';

const router = Router();

router.post('/assets/image', requireAdmin, maybeUploadNewsAssets, uploadInsightImage);
router.post('/', requireAdmin, maybeUploadNewsAssets, createInsight);
router.put('/:slug', requireAdmin, maybeUploadNewsAssets, updateInsightBySlug);
router.delete('/:slug', requireAdmin, deleteInsightBySlug);

export default router;

import { Router } from 'express';
import { getInsightBySlug, listInsights } from '../controllers/insightController.js';

const router = Router();

router.get('/', listInsights);
router.get('/:slug', getInsightBySlug);

export default router;

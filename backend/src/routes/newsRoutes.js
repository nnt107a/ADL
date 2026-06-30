import { Router } from 'express';
import { getNewsBySlug, listNews } from '../controllers/newsController.js';

const router = Router();

router.get('/', listNews);
router.get('/:slug', getNewsBySlug);

export default router;

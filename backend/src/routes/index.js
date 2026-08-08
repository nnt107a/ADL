import { Router } from 'express';
import adminNewsRoutes from './adminNewsRoutes.js';
import adminInsightRoutes from './adminInsightRoutes.js';
import adminPeopleRoutes from './adminPeopleRoutes.js';
import adminMessageRoutes from './adminMessageRoutes.js';
import contactRoutes from './contactRoutes.js';
import insightRoutes from './insightRoutes.js';
import newsRoutes from './newsRoutes.js';
import peopleRoutes from './peopleRoutes.js';
import sessionRoutes from './sessionRoutes.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'ADL API' });
});

router.use(sessionRoutes);
router.use('/admin/news', adminNewsRoutes);
router.use('/admin/insights', adminInsightRoutes);
router.use('/admin/people', adminPeopleRoutes);
router.use('/admin/messages', adminMessageRoutes);
router.use('/contact', contactRoutes);
router.use('/insights', insightRoutes);
router.use('/news', newsRoutes);
router.use('/people', peopleRoutes);

export default router;

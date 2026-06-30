import { Router } from 'express';
import adminNewsRoutes from './adminNewsRoutes.js';
import adminPeopleRoutes from './adminPeopleRoutes.js';
import newsRoutes from './newsRoutes.js';
import peopleRoutes from './peopleRoutes.js';
import sessionRoutes from './sessionRoutes.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'ADL API' });
});

router.use(sessionRoutes);
router.use('/admin/news', adminNewsRoutes);
router.use('/admin/people', adminPeopleRoutes);
router.use('/news', newsRoutes);
router.use('/people', peopleRoutes);

export default router;

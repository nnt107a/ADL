import { Router } from 'express';
import {
  getSession,
  grantAdminSession,
  logout,
  requireAdminSession,
} from '../controllers/sessionController.js';

const router = Router();

router.get('/session', getSession);
router.post('/grant-admin', grantAdminSession);
router.post('/logout', logout);
router.get('/admin/session', requireAdminSession);

export default router;

import { Router } from 'express';
import {
  deleteAdminMessage,
  getAdminMessageById,
  getAdminMessages,
  replyToAdminMessage,
} from '../controllers/adminMessageController.js';
import requireAdmin from '../middleware/requireAdmin.js';

const router = Router();

router.get('/', requireAdmin, getAdminMessages);
router.get('/:id', requireAdmin, getAdminMessageById);
router.post('/:id/reply', requireAdmin, replyToAdminMessage);
router.delete('/:id', requireAdmin, deleteAdminMessage);

export default router;

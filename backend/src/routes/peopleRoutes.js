import { Router } from 'express';
import requireAdmin from '../middleware/requireAdmin.js';
import {
  createPerson,
  deletePerson,
  getPersonById,
  listPeople,
  updatePerson,
} from '../controllers/peopleController.js';

const router = Router();

// Public read endpoints
router.get('/', listPeople);
router.get('/:id', getPersonById);

// Protected write endpoints
router.post('/', requireAdmin, createPerson);
router.put('/:id', requireAdmin, updatePerson);
router.delete('/:id', requireAdmin, deletePerson);

export default router;

import { Router } from 'express';
import requireAdmin from '../middleware/requireAdmin.js';
import maybeUploadPeopleImage from '../middleware/peopleAssetsUpload.js';
import { uploadPeopleImage } from '../controllers/peopleUploadsController.js';

const router = Router();

router.post('/assets/avatar', requireAdmin, maybeUploadPeopleImage, (req, res, next) =>
  uploadPeopleImage(req, res, next, { kind: 'avatar' })
);

router.post('/assets/cover', requireAdmin, maybeUploadPeopleImage, (req, res, next) =>
  uploadPeopleImage(req, res, next, { kind: 'cover' })
);

export default router;

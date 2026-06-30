import { hasAdminSession } from '../utils/adminSession.js';

export default function requireAdmin(req, res, next) {
  if (hasAdminSession(req)) {
    return next();
  }

  const adminKey = process.env.ADMIN_KEY;
  const providedKey = req.header('x-admin-key');

  if (adminKey && providedKey === adminKey) {
    return next();
  }

  return res.status(403).json({ message: 'Admin session required.' });
}

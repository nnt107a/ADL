import {
  clearAdminSessionCookie,
  hasAdminSession,
  readAdminSession,
  setAdminSessionCookie,
} from '../utils/adminSession.js';

export function grantAdminSession(_req, res) {
  setAdminSessionCookie(res);
  res.json({ status: 'success', role: 'admin' });
}

export function getSession(req, res) {
  const session = readAdminSession(req);
  res.json({
    role: session?.role || 'guest',
    isAdmin: Boolean(session),
  });
}

export function logout(_req, res) {
  clearAdminSessionCookie(res);
  res.json({ status: 'success', role: 'guest' });
}

export function requireAdminSession(req, res) {
  if (!hasAdminSession(req)) {
    return res.status(403).json({ message: 'Admin session required.' });
  }

  return res.json({ status: 'success', role: 'admin' });
}

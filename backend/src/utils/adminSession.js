import crypto from 'crypto';

const ADMIN_COOKIE_NAME = 'adl_admin_session';
const ADMIN_ROLE = 'admin';

function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_KEY || 'adl-dev-admin-session-secret';
}

function base64UrlEncode(value) {
  return Buffer.from(value).toString('base64url');
}

function base64UrlDecode(value) {
  return Buffer.from(value, 'base64url').toString('utf8');
}

function sign(value) {
  return crypto.createHmac('sha256', getSessionSecret()).update(value).digest('base64url');
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function parseCookies(headerValue = '') {
  return String(headerValue || '')
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((cookies, part) => {
      const separatorIndex = part.indexOf('=');

      if (separatorIndex === -1) {
        return cookies;
      }

      const name = part.slice(0, separatorIndex).trim();
      const value = part.slice(separatorIndex + 1).trim();

      if (name) {
        cookies[name] = decodeURIComponent(value);
      }

      return cookies;
    }, {});
}

function serializeCookie(name, value, options = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`];

  parts.push(`Path=${options.path || '/'}`);
  parts.push(`SameSite=${options.sameSite || 'Lax'}`);

  if (options.httpOnly !== false) {
    parts.push('HttpOnly');
  }

  if (options.secure) {
    parts.push('Secure');
  }

  if (options.maxAge !== undefined) {
    parts.push(`Max-Age=${options.maxAge}`);
  }

  return parts.join('; ');
}

export function createAdminSessionValue() {
  const payload = base64UrlEncode(
    JSON.stringify({
      role: ADMIN_ROLE,
      issuedAt: Date.now(),
    })
  );
  const signature = sign(payload);

  return `${payload}.${signature}`;
}

export function readAdminSession(req) {
  const cookies = parseCookies(req.headers.cookie);
  const sessionValue = cookies[ADMIN_COOKIE_NAME];

  if (!sessionValue) {
    return null;
  }

  const [payload, signature] = sessionValue.split('.');

  if (!payload || !signature || !safeEqual(signature, sign(payload))) {
    return null;
  }

  try {
    const session = JSON.parse(base64UrlDecode(payload));
    return session?.role === ADMIN_ROLE ? session : null;
  } catch {
    return null;
  }
}

export function hasAdminSession(req) {
  return Boolean(readAdminSession(req));
}

export function setAdminSessionCookie(res) {
  res.setHeader(
    'Set-Cookie',
    serializeCookie(ADMIN_COOKIE_NAME, createAdminSessionValue(), {
      httpOnly: true,
      sameSite: 'Lax',
      secure: process.env.NODE_ENV === 'production',
    })
  );
}

export function clearAdminSessionCookie(res) {
  res.setHeader(
    'Set-Cookie',
    serializeCookie(ADMIN_COOKIE_NAME, '', {
      httpOnly: true,
      sameSite: 'Lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 0,
    })
  );
}

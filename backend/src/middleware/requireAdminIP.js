/**
 * IP-Based Authentication Middleware
 * Validates client IP against whitelist before allowing access
 * Falls back to API key auth if IP check passes
 */

import { extractClientIP, validateIPWhitelist, isIPWhitelistConfigured } from '../utils/ipUtils.js';

/**
 * Middleware to enforce IP-based access control
 * 
 * Environment variable: ADMIN_ALLOWED_IPS
 * Format: Comma-separated list of allowed IP addresses
 * Example: ADMIN_ALLOWED_IPS=192.168.1.100,10.0.0.1,127.0.0.1
 * 
 * If ADMIN_ALLOWED_IPS is not configured, this middleware is skipped (backward compatible)
 * 
 * Behavior:
 * - IP in whitelist: Proceed to next middleware (API key check)
 * - IP NOT in whitelist: Return 403 Forbidden
 * - No whitelist configured: Skip IP check, proceed to next middleware
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export function requireAdminIP(req, res, next) {
  const whitelistEnv = process.env.ADMIN_ALLOWED_IPS;

  // If whitelist is not configured, skip IP validation
  if (!isIPWhitelistConfigured(whitelistEnv)) {
    return next();
  }

  // Extract client IP (handles proxies)
  const clientIP = extractClientIP(req);

  // Validate IP against whitelist
  const isAllowed = validateIPWhitelist(clientIP, whitelistEnv);

  if (!isAllowed) {
    console.warn(
      `[SECURITY] Access denied from IP: ${clientIP} to ${req.method} ${req.path}`
    );

    return res.status(403).json({
      message: 'Access denied from this IP address',
    });
  }

  // IP is allowed, proceed to next middleware
  console.info(`[AUTH] IP ${clientIP} allowed for ${req.method} ${req.path}`);
  next();
}

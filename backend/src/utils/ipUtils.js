/**
 * IP Utility Functions
 * Handles IP extraction from requests and validation against whitelists
 */

/**
 * Extract client IP from request
 * Handles reverse proxy scenarios (Koyeb, Docker, etc.)
 *
 * Priority order:
 * 1. X-Forwarded-For header (first IP in list) - for reverse proxies
 * 2. X-Real-IP header - alternative proxy header
 * 3. req.ip - direct connection IP
 *
 * @param {Object} req - Express request object
 * @returns {string} Client IP address
 */
export function extractClientIP(req) {
  // Check X-Forwarded-For header (standard for reverse proxies)
  if (req.headers['x-forwarded-for']) {
    // Take the first IP in the comma-separated list (original client IP)
    const forwarded = req.headers['x-forwarded-for'].split(',')[0].trim();
    if (forwarded) {
      return forwarded;
    }
  }

  // Check X-Real-IP header (alternative proxy header)
  if (req.headers['x-real-ip']) {
    const realIP = req.headers['x-real-ip'].trim();
    if (realIP) {
      return realIP;
    }
  }

  // Fallback to direct connection IP
  return req.ip || 'unknown';
}

/**
 * Validate client IP against whitelist
 * Handles both presence/absence of whitelist gracefully
 *
 * @param {string} clientIP - Client IP to validate
 * @param {string} whitelistEnv - Comma-separated list of allowed IPs from env var
 * @returns {boolean} True if IP is allowed, false otherwise
 */
export function validateIPWhitelist(clientIP, whitelistEnv) {
  // If no whitelist is configured, allow all IPs (backward compatible)
  if (!whitelistEnv || whitelistEnv.trim() === '') {
    return true;
  }

  // Parse whitelist: split by comma and trim whitespace
  const allowedIPs = whitelistEnv
    .split(',')
    .map((ip) => ip.trim())
    .filter((ip) => ip.length > 0);

  // Check if client IP is in the whitelist
  return allowedIPs.includes(clientIP);
}

/**
 * Parse whitelist from environment variable
 * Utility function for getting whitelist array directly
 *
 * @param {string} whitelistEnv - Comma-separated list of allowed IPs
 * @returns {string[]} Array of allowed IPs
 */
export function parseIPWhitelist(whitelistEnv) {
  if (!whitelistEnv || whitelistEnv.trim() === '') {
    return [];
  }

  return whitelistEnv
    .split(',')
    .map((ip) => ip.trim())
    .filter((ip) => ip.length > 0);
}

/**
 * Check if IP whitelist is configured
 * Useful for logging/debugging
 *
 * @param {string} whitelistEnv - Environment variable value
 * @returns {boolean} True if whitelist is configured, false otherwise
 */
export function isIPWhitelistConfigured(whitelistEnv) {
  return whitelistEnv && whitelistEnv.trim().length > 0;
}
